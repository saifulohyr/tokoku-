// order.dto.ts - Zod Schemas for Order Management
import { z } from 'zod';

// ============================================
// Order Item DTO
// ============================================
export const OrderItemSchema = z.object({
  productId: z.number().int().positive('Product ID must be positive'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

export type OrderItemDto = z.infer<typeof OrderItemSchema>;

// ============================================
// Create Order DTO
// ============================================
export const CreateOrderSchema = z.object({
  items: z
    .array(OrderItemSchema)
    .min(1, 'Order must contain at least one item'),
  // Shipping Address (optional for backwards compatibility)
  shippingAddress: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  shippingPhone: z.string().optional(),
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;

// ============================================
// Order Status Enum
// ============================================
export const OrderStatus = {
  PENDING: 'PENDING',
  AWAITING_PAYMENT: 'AWAITING_PAYMENT',
  PAID: 'PAID',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus];

// ============================================
// Order Response
// ============================================
export const OrderResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  totalPrice: z.number(),
  status: z.string(),
  paymentId: z.string().nullable(),
  snapToken: z.string().nullable(),
  createdAt: z.string().nullable(),
  items: z.array(
    z.object({
      productId: z.number(),
      quantity: z.number(),
      priceAtOrder: z.number(),
    }),
  ),
});

export type OrderResponse = z.infer<typeof OrderResponseSchema>;
