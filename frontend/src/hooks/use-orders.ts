"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as ordersApi from "@/lib/api/orders";
import type { Order, CreateOrderInput } from "@/lib/schemas/order";

// Get user orders
export function useOrders() {
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: ordersApi.getOrders,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Get single order
export function useOrder(id: number) {
  return useQuery<Order>({
    queryKey: ["orders", id],
    queryFn: () => ordersApi.getOrder(id),
    enabled: id > 0,
  });
}

// Create order mutation
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderInput) => ordersApi.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] }); // Refresh stock
      toast.success("Pesanan berhasil dibuat");
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      const message = error.response?.data?.error || "Gagal membuat pesanan";
      toast.error(message);
    },
  });
}

// Check payment status mutation
export function useCheckPaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => ordersApi.checkPaymentStatus(orderId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      if (data.updated) {
        toast.success(`Status pesanan #${data.orderId} diperbarui ke ${data.currentStatus}`);
      } else {
        toast.info(`Status pesanan #${data.orderId}: ${data.currentStatus}`);
      }
    },
    onError: () => {
      toast.error("Gagal mengecek status pembayaran");
    },
  });
}
