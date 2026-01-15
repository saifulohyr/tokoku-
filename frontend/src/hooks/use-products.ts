"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as productsApi from "@/lib/api/products";
import type { Product, CreateProductInput } from "@/lib/schemas/product";

import { useSearchParams } from "next/navigation";

// Get all products with filters
export function useProducts() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  return useQuery<Product[]>({
    queryKey: ["products", category, search],
    queryFn: () => productsApi.getProducts({ category, search }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get single product
export function useProduct(id: number) {
  return useQuery<Product>({
    queryKey: ["products", id],
    queryFn: () => productsApi.getProduct(id),
    enabled: id > 0,
  });
}

// Create product mutation
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductInput) => productsApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produk berhasil ditambahkan");
    },
    onError: () => {
      toast.error("Gagal menambahkan produk");
    },
  });
}

// Update product mutation
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateProductInput> }) => 
      productsApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produk berhasil diperbarui");
    },
    onError: () => {
      toast.error("Gagal memperbarui produk");
    },
  });
}

// Delete product mutation
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produk berhasil dihapus");
    },
    onError: () => {
      toast.error("Gagal menghapus produk");
    },
  });
}
