// product.dto.ts - Zod Schemas for Product Management
import { z } from 'zod';

// ============================================
// Create Product DTO
// ============================================
export const CreateProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(255, 'Product name must not exceed 255 characters'),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z
    .number()
    .int('Price must be an integer')
    .positive('Price must be positive'),
  stock: z
    .number()
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative'),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;

// ============================================
// Update Product DTO
// ============================================
export const UpdateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.number().int().positive().optional(),
  stock: z.number().int().min(0).optional(),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
});

export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;

// ============================================
// Stock Update DTO (for atomic operations)
// ============================================
export const StockUpdateSchema = z.object({
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .positive('Quantity must be positive'),
});

export type StockUpdateDto = z.infer<typeof StockUpdateSchema>;
