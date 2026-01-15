import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { eq, sql, like, and, desc } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_CONNECTION } from '../../database/database.module';
import * as schema from '../../database/schema';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findAll(filters?: { category?: string; name?: string; sort?: string }) {
    let query = this.db.select().from(schema.products);
    
    const conditions = [];
    
    if (filters?.category) {
      conditions.push(eq(schema.products.category, filters.category));
    }
    
    if (filters?.name) {
      conditions.push(like(schema.products.name, `%${filters.name}%`));
    }
    
    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    if (filters?.sort === 'newest') {
      query.orderBy(desc(schema.products.createdAt));
    } else if (filters?.sort === 'price_asc') {
      query.orderBy(schema.products.price);
    } else if (filters?.sort === 'price_desc') {
      query.orderBy(desc(schema.products.price));
    }
    
    return query;
  }

  async findOne(id: number) {
    const [product] = await this.db
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, id))
      .limit(1);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async create(createProductDto: CreateProductDto) {
    const [product] = await this.db
      .insert(schema.products)
      .values(createProductDto)
      .returning();

    this.logger.log(`Product created: ${product.name} (ID: ${product.id})`);
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const existing = await this.findOne(id);

    const [updated] = await this.db
      .update(schema.products)
      .set({
        ...updateProductDto,
        updatedAt: new Date(),
      })
      .where(eq(schema.products.id, id))
      .returning();

    this.logger.log(`Product updated: ${existing.name} (ID: ${id})`);
    return updated;
  }

  async remove(id: number) {
    const existing = await this.findOne(id);

    await this.db.delete(schema.products).where(eq(schema.products.id, id));

    this.logger.log(`Product deleted: ${existing.name} (ID: ${id})`);
    return { message: 'Product deleted successfully' };
  }

  /**
   * ATOMIC STOCK DEDUCTION - Prevents Race Conditions
   * Uses SQL: SET stock = stock - quantity WHERE id = ? AND stock >= quantity
   * This ensures concurrent orders cannot over-deduct stock
   */
  async deductStock(productId: number, quantity: number): Promise<boolean> {
    const result = await this.db
      .update(schema.products)
      .set({
        stock: sql`${schema.products.stock} - ${quantity}`,
        updatedAt: new Date(),
      })
      .where(
        sql`${schema.products.id} = ${productId} AND ${schema.products.stock} >= ${quantity}`,
      )
      .returning();

    if (result.length === 0) {
      this.logger.warn(
        `Stock deduction failed for product ${productId}: insufficient stock or not found`,
      );
      return false;
    }

    this.logger.log(
      `Stock deducted: Product ${productId}, Quantity: ${quantity}, New Stock: ${result[0].stock}`,
    );
    return true;
  }

  /**
   * STOCK RESTORATION - Compensation for failed orders (Saga Pattern)
   */
  async restoreStock(productId: number, quantity: number): Promise<void> {
    const [result] = await this.db
      .update(schema.products)
      .set({
        stock: sql`${schema.products.stock} + ${quantity}`,
        updatedAt: new Date(),
      })
      .where(eq(schema.products.id, productId))
      .returning();

    if (!result) {
      throw new BadRequestException(
        `Failed to restore stock for product ${productId}`,
      );
    }

    this.logger.log(
      `Stock restored: Product ${productId}, Quantity: ${quantity}, New Stock: ${result.stock}`,
    );
  }

  /**
   * Check stock availability without modifying
   */
  async checkStock(productId: number, quantity: number): Promise<boolean> {
    const product = await this.findOne(productId);
    return product.stock >= quantity;
  }
}
