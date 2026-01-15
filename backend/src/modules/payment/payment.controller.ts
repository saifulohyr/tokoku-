// payment.controller.ts - Payment Controller with Webhook
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { OrderService } from '../order/order.service';
import { MidtransSignatureGuard } from './guards/midtrans-signature.guard';
import { Public } from '../../common/decorators/public.decorator';
import { MidtransNotificationSchema } from './dto/payment.dto';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
  ) {}

  @Post('webhook')
  @Public() // Webhook must be accessible without auth
  @UseGuards(MidtransSignatureGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Midtrans payment notification webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  @ApiResponse({ status: 401, description: 'Invalid signature' })
  async handleWebhook(@Body() notification: unknown) {
    // Validate notification schema
    const parsed = MidtransNotificationSchema.parse(notification);

    // Process webhook
    const result = await this.paymentService.handleWebhook({
      order_id: parsed.order_id,
      transaction_status: parsed.transaction_status,
      transaction_id: parsed.transaction_id,
      fraud_status: parsed.fraud_status,
    });

    // Update order status
    await this.orderService.updateOrderStatus(
      result.orderId,
      result.status,
      result.paymentId,
    );

    return { success: true, message: 'Webhook processed' };
  }

  @Get('config')
  @Public()
  @ApiOperation({ summary: 'Get payment configuration (public)' })
  @ApiResponse({ status: 200, description: 'Configuration retrieved' })
  async getConfig() {
    return this.paymentService.getConfig();
  }

  @Get('status/:orderId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment status for an order' })
  @ApiParam({ name: 'orderId', type: 'string' })
  @ApiResponse({ status: 200, description: 'Payment status retrieved' })
  async getStatus(@Param('orderId') orderId: string) {
    return this.paymentService.getTransactionStatus(orderId);
  }

  @Post('check-status/:orderId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check and update payment status from Midtrans' })
  @ApiParam({ name: 'orderId', type: 'number', description: 'Order ID (numeric)' })
  @ApiResponse({ status: 200, description: 'Payment status checked and updated' })
  async checkAndUpdateStatus(@Param('orderId') orderId: string) {
    try {
      const numericOrderId = parseInt(orderId, 10);
      
      // Fetch the order to get the stored paymentId (Midtrans Reference)
      // This helps tracking which exact transaction belongs to this order
      const order = await this.orderService.getOrderById(numericOrderId);
      const midtransRef = order?.paymentId || undefined;

      // Get the order's snap token or transaction ID to query Midtrans
      const result = await this.paymentService.checkStatusFromMidtrans(numericOrderId, midtransRef);
      
      if (result.shouldUpdate) {
        await this.orderService.updateOrderStatus(
          numericOrderId,
          result.status,
          result.paymentId,
        );
      }
      
      return {
        success: true,
        orderId: numericOrderId,
        previousStatus: result.previousStatus,
        currentStatus: result.status,
        updated: result.shouldUpdate,
      };
    } catch (error) {
      // Logger is not instantiated in properties? controller usually doesn't have logger unless defined
      // Let's use console.error or define logger. The file has NO logger property
      console.error(`Failed to check status for order ${orderId}:`, error);
      throw new BadRequestException('Gagal mengecek status pembayaran');
    }
  }
}
