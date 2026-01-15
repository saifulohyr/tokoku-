// payment.dto.ts - Payment DTOs
import { z } from 'zod';

// ============================================
// Payment Request (Internal)
// ============================================
export const PaymentRequestSchema = z.object({
  orderId: z.number().int().positive(),
  amount: z.number().int().positive(),
  userId: z.number().int().positive(),
});

export type PaymentRequest = z.infer<typeof PaymentRequestSchema>;

// ============================================
// Payment Result
// ============================================
export interface PaymentResult {
  success: boolean;
  paymentId: string | null;
  snapToken: string | null;
  status: string;
  redirectUrl?: string;
}

// ============================================
// Midtrans Webhook Notification
// ============================================
export const MidtransNotificationSchema = z.object({
  transaction_time: z.string(),
  transaction_status: z.string(),
  transaction_id: z.string(),
  status_message: z.string(),
  status_code: z.string(),
  signature_key: z.string(),
  payment_type: z.string(),
  order_id: z.string(),
  merchant_id: z.string().optional(),
  gross_amount: z.string(),
  fraud_status: z.string().optional(),
  currency: z.string().optional(),
});

export type MidtransNotification = z.infer<typeof MidtransNotificationSchema>;

// ============================================
// Payment Status
// ============================================
export const PaymentStatus = {
  PENDING: 'PENDING',
  AWAITING_PAYMENT: 'AWAITING_PAYMENT',
  CAPTURE: 'PAID',
  SETTLEMENT: 'PAID',
  DENY: 'FAILED',
  CANCEL: 'CANCELLED',
  EXPIRE: 'FAILED',
  REFUND: 'REFUNDED',
} as const;
