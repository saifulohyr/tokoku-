// schema.ts - Drizzle ORM Schema for Distributed E-commerce
import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// 1. User Service Data
// ============================================
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: text('password').notNull(),
  role: varchar('role', { length: 50 }).default('user').notNull(), // user, admin
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

// ============================================
// 2. Product Service Data
// ============================================
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: integer('price').notNull(), // in smallest currency unit (e.g., cents/rupiah)
  stock: integer('stock').notNull().default(0), // Critical for race condition handling
  category: varchar('category', { length: 100 }), // Category for filtering (shoes, men, women, kids, sports, accessories)
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
}));

// ============================================
// 3. Order Service Data (Saga Orchestrator)
// ============================================
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  totalPrice: integer('total_price').notNull(),
  status: varchar('status', { length: 50 }).default('PENDING').notNull(),
  // Status: PENDING, AWAITING_PAYMENT, PAID, FAILED, CANCELLED, REFUNDED
  paymentId: varchar('payment_id', { length: 255 }),
  snapToken: varchar('snap_token', { length: 255 }), // Midtrans Snap token
  // Shipping Address
  shippingAddress: text('shipping_address'),
  shippingCity: varchar('shipping_city', { length: 100 }),
  shippingPostalCode: varchar('shipping_postal_code', { length: 20 }),
  shippingPhone: varchar('shipping_phone', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

// ============================================
// 4. Order Items (Detail Pesanan)
// ============================================
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .references(() => orders.id)
    .notNull(),
  productId: integer('product_id')
    .references(() => products.id)
    .notNull(),
  quantity: integer('quantity').notNull(),
  priceAtOrder: integer('price_at_order').notNull(), // Price snapshot at order time
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// ============================================
// Type exports for use across modules
// ============================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
