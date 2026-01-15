// Products API Functions
import { api, extractData, type ApiResponse } from "./client";
import type { Product, CreateProductInput } from "../schemas/product";

export async function getProducts(filters?: { category?: string | null; search?: string | null }): Promise<Product[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.append("category", filters.category);
  if (filters?.search) params.append("name", filters.search); // Backend likely uses 'name' for search

  const queryString = params.toString();
  const endpoint = queryString ? `/products?${queryString}` : "/products";
  
  const response = await api.get<ApiResponse<Product[]>>(endpoint);
  return extractData(response);
}

export async function getProduct(id: number): Promise<Product> {
  const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
  return extractData(response);
}

export async function createProduct(data: CreateProductInput): Promise<Product> {
  const response = await api.post<ApiResponse<Product>>("/products", data);
  return extractData(response);
}

export async function updateProduct(id: number, data: Partial<CreateProductInput>): Promise<Product> {
  const response = await api.put<ApiResponse<Product>>(`/products/${id}`, data);
  return extractData(response);
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete<ApiResponse<void>>(`/products/${id}`);
}
