// Admin API Functions
import { api, extractData, type ApiResponse } from "./client";

// Types
export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
  createdAt: string | null;
}

export interface AdminOrder {
  id: number;
  userId: number;
  totalPrice: number;
  status: string;
  paymentId: string | null;
  createdAt: string | null;
  user: {
    fullName: string;
    email: string;
  };
  shippingAddress?: string;
  shippingCity?: string;
  shippingPostalCode?: string;
  shippingPhone?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: {
    id: number;
    totalPrice: number;
    status: string;
    createdAt: string | null;
  }[];
}

// API Calls
export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await api.get<ApiResponse<AdminUser[]>>("/admin/users");
  return extractData(response);
}

export async function updateUserRole(userId: number, role: string): Promise<AdminUser> {
  const response = await api.put<ApiResponse<AdminUser>>(`/admin/users/${userId}/role`, { role });
  return extractData(response);
}

export async function deleteUser(userId: number): Promise<{ message: string }> {
  const response = await api.delete<ApiResponse<{ message: string }>>(`/admin/users/${userId}`);
  return extractData(response);
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  const response = await api.get<ApiResponse<AdminOrder[]>>("/admin/orders");
  return extractData(response);
}

export async function getAdminStats(): Promise<AdminStats> {
  const response = await api.get<ApiResponse<AdminStats>>("/admin/stats");
  return extractData(response);
}
