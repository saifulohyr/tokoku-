import { z } from "zod";

// ============================================
// Order types
// ============================================
export interface OrderItem {
  id?: number;
  productId: number;
  quantity: number;
  priceAtOrder: number;
  productName?: string;
  productImage?: string | null;
}

export interface Order {
  id: number;
  userId: number;
  totalPrice: number;
  status: OrderStatus;
  paymentId: string | null;
  snapToken: string | null;
  createdAt: string | null;
  updatedAt?: string | null;
  items: OrderItem[];
  // Shipping Address
  shippingAddress?: string | null;
  shippingCity?: string | null;
  shippingPostalCode?: string | null;
  shippingPhone?: string | null;
}

export type OrderStatus = 
  | "PENDING" 
  | "AWAITING_PAYMENT" 
  | "PAID" 
  | "FAILED" 
  | "CANCELLED" 
  | "REFUNDED";

// ============================================
// Create Order DTO
// ============================================
export const OrderItemSchema = z.object({
  productId: z.number().int().positive("Product ID tidak valid"),
  quantity: z.number().int().positive("Jumlah minimal 1"),
});

export const CreateOrderSchema = z.object({
  items: z
    .array(OrderItemSchema)
    .min(1, "Pesanan harus memiliki minimal 1 item"),
  // Shipping Address
  shippingAddress: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  shippingPhone: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// ============================================
// Cart Item (for local state)
// ============================================
export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  stock: number;
}
