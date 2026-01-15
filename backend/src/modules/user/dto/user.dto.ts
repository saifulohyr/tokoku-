// user.dto.ts - Zod Schemas for User Authentication
import { z } from 'zod';

// ============================================
// Registration DTO
// ============================================
export const RegisterSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(255, 'Full name must not exceed 255 characters'),
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

// ============================================
// Login DTO
// ============================================
export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginDto = z.infer<typeof LoginSchema>;

// ============================================
// Auth Response (for Swagger documentation)
// ============================================
export const AuthResponseSchema = z.object({
  user: z.object({
    id: z.number(),
    fullName: z.string(),
    email: z.string(),
    role: z.string(),
    createdAt: z.string().optional(),
  }),
  accessToken: z.string(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// ============================================
// Profile Response
// ============================================
export const ProfileResponseSchema = z.object({
  id: z.number(),
  fullName: z.string(),
  email: z.string(),
  role: z.string(),
  createdAt: z.string().nullable(),
});

export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;
