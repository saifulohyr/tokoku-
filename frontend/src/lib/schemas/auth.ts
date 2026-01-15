import { z } from "zod";

// ============================================
// Registration DTO - Same as backend
// ============================================
export const RegisterSchema = z.object({
  fullName: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(255, "Nama maksimal 255 karakter"),
  email: z
    .string()
    .email("Format email tidak valid")
    .max(255, "Email maksimal 255 karakter"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(100, "Password maksimal 100 karakter")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password harus mengandung huruf besar, huruf kecil, dan angka"
    ),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

// ============================================
// Login DTO - Same as backend
// ============================================
export const LoginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// ============================================
// User type
// ============================================
export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
