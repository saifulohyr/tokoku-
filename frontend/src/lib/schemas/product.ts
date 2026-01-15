import { z } from "zod";

// ============================================
// Product type
// ============================================
export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Create Product DTO
// ============================================
export const CreateProductSchema = z.object({
  name: z
    .string()
    .min(1, "Nama produk wajib diisi")
    .max(255, "Nama produk maksimal 255 karakter"),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z
    .number()
    .int("Harga harus bilangan bulat")
    .positive("Harga harus lebih dari 0"),
  stock: z
    .number()
    .int("Stok harus bilangan bulat")
    .min(0, "Stok tidak boleh negatif"),
  imageUrl: z.string().url("URL gambar tidak valid").optional().or(z.literal("")),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
