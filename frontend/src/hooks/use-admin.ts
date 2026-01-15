"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as adminApi from "@/lib/api/admin";

// Get all users
export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: adminApi.getAdminUsers,
  });
}

// Update user role
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      adminApi.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Role pengguna berhasil diubah");
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      const message = error.response?.data?.error || "Gagal mengubah role";
      toast.error(message);
    },
  });
}

// Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Pengguna berhasil dihapus");
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      const message = error.response?.data?.error || "Gagal menghapus pengguna";
      toast.error(message);
    },
  });
}

// Get all orders (admin)
export function useAdminOrders() {
  return useQuery({
    queryKey: ["admin", "orders"],
    queryFn: adminApi.getAdminOrders,
  });
}

// Get dashboard stats
export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: adminApi.getAdminStats,
  });
}
