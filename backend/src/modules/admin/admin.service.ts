// admin.service.ts - Admin Service for User and Order Management
import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { eq, desc, sql, count, sum } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_CONNECTION } from '../../database/database.module';
import * as schema from '../../database/schema';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  // ============================================
  // USER MANAGEMENT
  // ============================================

  async findAllUsers() {
    const users = await this.db
      .select({
        id: schema.users.id,
        fullName: schema.users.fullName,
        email: schema.users.email,
        role: schema.users.role,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .orderBy(desc(schema.users.createdAt));

    return users.map(user => ({
      ...user,
      createdAt: user.createdAt?.toISOString() ?? null,
    }));
  }

  async updateUserRole(userId: number, newRole: string, currentAdminId: number) {
    // Prevent admin from changing their own role
    if (userId === currentAdminId) {
      throw new ForbiddenException('Cannot change your own role');
    }

    // Validate role
    if (!['user', 'admin'].includes(newRole)) {
      throw new ForbiddenException('Invalid role. Must be "user" or "admin"');
    }

    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const [updated] = await this.db
      .update(schema.users)
      .set({ role: newRole, updatedAt: new Date() })
      .where(eq(schema.users.id, userId))
      .returning();

    this.logger.log(`User ${userId} role changed to ${newRole} by admin ${currentAdminId}`);

    return {
      id: updated.id,
      fullName: updated.fullName,
      email: updated.email,
      role: updated.role,
    };
  }

  async deleteUser(userId: number, currentAdminId: number) {
    // Prevent admin from deleting themselves
    if (userId === currentAdminId) {
      throw new ForbiddenException('Cannot delete your own account');
    }

    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Delete user's order items first, then orders, then user
    const userOrders = await this.db
      .select({ id: schema.orders.id })
      .from(schema.orders)
      .where(eq(schema.orders.userId, userId));

    for (const order of userOrders) {
      await this.db.delete(schema.orderItems).where(eq(schema.orderItems.orderId, order.id));
    }

    await this.db.delete(schema.orders).where(eq(schema.orders.userId, userId));
    await this.db.delete(schema.users).where(eq(schema.users.id, userId));

    this.logger.log(`User ${userId} (${user.email}) deleted by admin ${currentAdminId}`);

    return { message: `User ${user.email} deleted successfully` };
  }

  // ============================================
  // ORDER MANAGEMENT (ALL ORDERS)
  // ============================================

  async findAllOrders() {
    const orders = await this.db
      .select({
        id: schema.orders.id,
        userId: schema.orders.userId,
        totalPrice: schema.orders.totalPrice,
        status: schema.orders.status,
        paymentId: schema.orders.paymentId,
        createdAt: schema.orders.createdAt,
        shippingAddress: schema.orders.shippingAddress,
        shippingCity: schema.orders.shippingCity,
        shippingPostalCode: schema.orders.shippingPostalCode,
        shippingPhone: schema.orders.shippingPhone,
      })
      .from(schema.orders)
      .orderBy(desc(schema.orders.createdAt));

    // Get user info for each order
    const ordersWithUser = await Promise.all(
      orders.map(async (order) => {
        const [user] = await this.db
          .select({ fullName: schema.users.fullName, email: schema.users.email })
          .from(schema.users)
          .where(eq(schema.users.id, order.userId))
          .limit(1);

        return {
          ...order,
          createdAt: order.createdAt?.toISOString() ?? null,
          user: user ?? { fullName: 'Unknown', email: 'unknown' },
        };
      })
    );

    return ordersWithUser;
  }

  // ============================================
  // DASHBOARD STATISTICS
  // ============================================

  async getStats() {
    // Total Users
    const [usersCount] = await this.db
      .select({ count: count() })
      .from(schema.users);

    // Total Products
    const [productsCount] = await this.db
      .select({ count: count() })
      .from(schema.products);

    // Total Orders
    const [ordersCount] = await this.db
      .select({ count: count() })
      .from(schema.orders);

    // Total Revenue (sum of PAID orders)
    const [revenue] = await this.db
      .select({ total: sum(schema.orders.totalPrice) })
      .from(schema.orders)
      .where(eq(schema.orders.status, 'PAID'));

    // Recent Orders (last 5)
    const recentOrders = await this.db
      .select({
        id: schema.orders.id,
        totalPrice: schema.orders.totalPrice,
        status: schema.orders.status,
        createdAt: schema.orders.createdAt,
      })
      .from(schema.orders)
      .orderBy(desc(schema.orders.createdAt))
      .limit(5);

    return {
      totalUsers: usersCount?.count ?? 0,
      totalProducts: productsCount?.count ?? 0,
      totalOrders: ordersCount?.count ?? 0,
      totalRevenue: revenue?.total ? Number(revenue.total) : 0,
      recentOrders: recentOrders.map(o => ({
        ...o,
        createdAt: o.createdAt?.toISOString() ?? null,
      })),
    };
  }
}
