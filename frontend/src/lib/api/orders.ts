// Orders API Functions
import { api, extractData, type ApiResponse } from "./client";
import type { Order, CreateOrderInput } from "@/lib/schemas/order";

export async function createOrder(data: CreateOrderInput): Promise<Order> {
  const response = await api.post<ApiResponse<Order>>("/orders", data);
  return extractData(response);
}

export async function getOrders(): Promise<Order[]> {
  const response = await api.get<ApiResponse<Order[]>>("/orders");
  return extractData(response);
}

export async function getOrder(id: number): Promise<Order> {
  const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
  return extractData(response);
}

export interface CheckPaymentStatusResult {
  success: boolean;
  orderId: number;
  previousStatus: string;
  currentStatus: string;
  updated: boolean;
}

export async function checkPaymentStatus(orderId: number): Promise<CheckPaymentStatusResult> {
  const response = await api.post(`/payment/check-status/${orderId}`);
  // Payment controller returns unwrapped response, not wrapped in { data: ... }
  return response.data;
}
