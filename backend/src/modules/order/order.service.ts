// order.service.ts - Order Service with Saga Pattern + Fault Tolerance
import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  Logger,
  RequestTimeoutException,
  forwardRef,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { eq, and } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
  lastValueFrom,
  from,
  retry,
  timeout,
  catchError,
  throwError,
  timer,
} from 'rxjs';
import { DATABASE_CONNECTION } from '../../database/database.module';
import * as schema from '../../database/schema';
import { ProductService } from '../product/product.service';
import { PaymentService } from '../payment/payment.service';
import { CreateOrderDto, OrderStatus } from './dto/order.dto';

export interface OrderCreatedEvent {
  orderId: number;
  userId: number;
  totalPrice: number;
  status: string;
}

export interface OrderFailedEvent {
  orderId: number;
  userId: number;
  reason: string;
}

// Fault Tolerance Configuration
const PAYMENT_TIMEOUT_MS = 15000; // 15 seconds timeout
const PAYMENT_RETRY_COUNT = 3; // Retry 3 times
const PAYMENT_RETRY_DELAY_MS = 1000; // 1 second delay between retries

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly productService: ProductService,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * SAGA PATTERN ORCHESTRATION with FAULT TOLERANCE
   * Step 1: Validate and deduct stock (atomic)
   * Step 2: Create order record
   * Step 3: Process payment with RETRY(3) and TIMEOUT(5000ms)
   * Step 4: If payment fails, compensate (restore stock)
   */
  async createOrder(userId: number, createOrderDto: CreateOrderDto) {
    const { items, shippingAddress, shippingCity, shippingPostalCode, shippingPhone } = createOrderDto;
    const deductedItems: { productId: number; quantity: number }[] = [];

    try {
      // Step 1: Validate products and calculate total
      let subtotal = 0;
      const orderItemsData: {
        productId: number;
        quantity: number;
        priceAtOrder: number;
      }[] = [];

      for (const item of items) {
        const product = await this.productService.findOne(item.productId);

        // Atomic stock deduction - prevents race condition
        const deducted = await this.productService.deductStock(
          item.productId,
          item.quantity,
        );

        if (!deducted) {
          throw new BadRequestException(
            `Insufficient stock for product: ${product.name}`,
          );
        }

        deductedItems.push({
          productId: item.productId,
          quantity: item.quantity,
        });

        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          priceAtOrder: product.price,
        });

        subtotal += product.price * item.quantity;
      }

      // Calculate Tax (11%) and Grand Total (Exclusive Tax Logic)
      const tax = subtotal * 0.11;
      const totalPrice = Math.round(subtotal + tax);

      // Step 2: Create order record
      const [order] = await this.db
        .insert(schema.orders)
        .values({
          userId,
          totalPrice,
          status: OrderStatus.PENDING,
          shippingAddress,
          shippingCity,
          shippingPostalCode,
          shippingPhone,
        })
        .returning();

      // Insert order items
      await this.db.insert(schema.orderItems).values(
        orderItemsData.map((item) => ({
          orderId: order.id,
          ...item,
        })),
      );

      this.logger.log(
        `Order created: ${order.id}, Total: ${totalPrice}, User: ${userId}`,
      );

      // Step 3: Process payment with FAULT TOLERANCE (retry + timeout)
      try {
        const paymentResult = await this.processPaymentWithFaultTolerance({
          orderId: order.id,
          amount: totalPrice,
          userId,
        });

        // Update order with payment info
        await this.db
          .update(schema.orders)
          .set({
            status: paymentResult.status,
            paymentId: paymentResult.paymentId,
            snapToken: paymentResult.snapToken,
            updatedAt: new Date(),
          })
          .where(eq(schema.orders.id, order.id));

        // Emit success event (async notification)
        this.eventEmitter.emit('order.success', {
          orderId: order.id,
          userId,
          totalPrice,
          status: paymentResult.status,
        } as OrderCreatedEvent);

        return {
          id: order.id,
          userId,
          totalPrice,
          status: paymentResult.status,
          paymentId: paymentResult.paymentId,
          snapToken: paymentResult.snapToken,
          items: orderItemsData,
          createdAt: order.createdAt?.toISOString() ?? null,
        };
      } catch (paymentError) {
        // Step 4: Payment failed - Compensate (restore stock)
        this.logger.error(`Payment failed for order ${order.id}`, paymentError);
        console.error('PAYMENT FAILURE DETAILED ERROR:', JSON.stringify(paymentError, null, 2)); // DEBUG LOG

        await this.compensateOrder(order.id, deductedItems);

        // Update order status to FAILED
        await this.db
          .update(schema.orders)
          .set({
            status: OrderStatus.FAILED,
            updatedAt: new Date(),
          })
          .where(eq(schema.orders.id, order.id));

        // Emit failure event (async notification)
        this.eventEmitter.emit('order.failed', {
          orderId: order.id,
          userId,
          reason: paymentError instanceof Error ? paymentError.message : 'Payment failed',
        } as OrderFailedEvent);

        throw new BadRequestException('Payment processing failed after retries. Stock has been restored.');
      }
    } catch (error) {
      // If any step fails before payment, compensate deducted items
      if (deductedItems.length > 0 && !(error instanceof BadRequestException)) {
        await this.compensateOrder(0, deductedItems);
      }
      throw error;
    }
  }

  /**
   * FAULT TOLERANCE: Payment with Retry(3) and Timeout(5000ms)
   * Uses RxJS operators for resilient inter-service communication
   */
  private async processPaymentWithFaultTolerance(request: {
    orderId: number;
    amount: number;
    userId: number;
  }) {
    this.logger.log(
      `Processing payment for order ${request.orderId} with FAULT TOLERANCE (timeout: ${PAYMENT_TIMEOUT_MS}ms, retries: ${PAYMENT_RETRY_COUNT})`,
    );

    let attemptCount = 0;

    const paymentObservable = from(
      this.paymentService.processPayment(request),
    ).pipe(
      // TIMEOUT: 5 seconds max wait time
      timeout({
        each: PAYMENT_TIMEOUT_MS,
        with: () =>
          throwError(
            () =>
              new RequestTimeoutException(
                `Payment service timeout after ${PAYMENT_TIMEOUT_MS}ms`,
              ),
          ),
      }),

      // RETRY: 3 attempts with 1 second delay
      retry({
        count: PAYMENT_RETRY_COUNT,
        delay: (error, retryCount) => {
          attemptCount = retryCount;
          this.logger.warn(
            `Payment attempt ${retryCount}/${PAYMENT_RETRY_COUNT} failed for order ${request.orderId}: ${error.message}. Retrying in ${PAYMENT_RETRY_DELAY_MS}ms...`,
          );
          return timer(PAYMENT_RETRY_DELAY_MS);
        },
      }),

      // Final error handler
      catchError((error) => {
        this.logger.error(
          `Payment FAILED after ${attemptCount} retries for order ${request.orderId}: ${error.message}`,
        );
        return throwError(
          () =>
            new BadRequestException(
              `Payment failed after ${PAYMENT_RETRY_COUNT} attempts: ${error.message}`,
            ),
        );
      }),
    );

    const result = await lastValueFrom(paymentObservable);
    this.logger.log(
      `Payment SUCCESS for order ${request.orderId} (attempts: ${attemptCount + 1})`,
    );
    return result;
  }

  /**
   * COMPENSATION - Restore stock for failed orders (Saga Pattern)
   */
  private async compensateOrder(
    orderId: number,
    items: { productId: number; quantity: number }[],
  ) {
    this.logger.warn(`COMPENSATING order ${orderId || 'unknown'}: restoring stock`);

    for (const item of items) {
      await this.productService.restoreStock(item.productId, item.quantity);
    }

    this.logger.log(`Stock restored for ${items.length} products`);
  }

  async findUserOrders(userId: number) {
    const orders = await this.db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.userId, userId))
      .orderBy(schema.orders.createdAt);

    const result = await Promise.all(
      orders.map(async (order) => {
        const items = await this.db
          .select({
            id: schema.orderItems.id,
            orderId: schema.orderItems.orderId,
            productId: schema.orderItems.productId,
            quantity: schema.orderItems.quantity,
            priceAtOrder: schema.orderItems.priceAtOrder,
            productName: schema.products.name,
            productImage: schema.products.imageUrl,
          })
          .from(schema.orderItems)
          .innerJoin(schema.products, eq(schema.orderItems.productId, schema.products.id))
          .where(eq(schema.orderItems.orderId, order.id));

        return {
          ...order,
          createdAt: order.createdAt?.toISOString() ?? null,
          updatedAt: order.updatedAt?.toISOString() ?? null,
          items,
        };
      }),
    );

    return result;
  }

  async findOne(userId: number, orderId: number) {
    const [order] = await this.db
      .select()
      .from(schema.orders)
      .where(
        and(eq(schema.orders.id, orderId), eq(schema.orders.userId, userId)),
      )
      .limit(1);

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    const items = await this.db
      .select({
        id: schema.orderItems.id,
        orderId: schema.orderItems.orderId,
        productId: schema.orderItems.productId,
        quantity: schema.orderItems.quantity,
        priceAtOrder: schema.orderItems.priceAtOrder,
        productName: schema.products.name,
        productImage: schema.products.imageUrl,
      })
      .from(schema.orderItems)
      .innerJoin(schema.products, eq(schema.orderItems.productId, schema.products.id))
      .where(eq(schema.orderItems.orderId, orderId));

    return {
      ...order,
      createdAt: order.createdAt?.toISOString() ?? null,
      updatedAt: order.updatedAt?.toISOString() ?? null,
      items,
    };
  }

  /**
   * Update order status (used by payment webhook)
   */
  async updateOrderStatus(orderId: number, status: string, paymentId?: string) {
    const [updated] = await this.db
      .update(schema.orders)
      .set({
        status,
        paymentId: paymentId ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(schema.orders.id, orderId))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    this.logger.log(`Order ${orderId} status updated to ${status}`);

    // Emit appropriate event
    if (status === OrderStatus.PAID) {
      this.eventEmitter.emit('order.success', {
        orderId,
        userId: updated.userId,
        totalPrice: updated.totalPrice,
        status,
      } as OrderCreatedEvent);
    }

    return updated;
  }

  /**
   * Get order by ID (internal use)
   */
  async getOrderById(orderId: number) {
    const [order] = await this.db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);
    
    return order || null;
  }
}
