"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as authApi from "@/lib/api/auth";
import type { RegisterInput, LoginInput, User } from "@/lib/schemas/auth";

// Check if user has token (client-side only)
function hasToken(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
}

// Get current user profile - only fetch if token exists
export function useProfile() {
  const tokenExists = hasToken();
  
  return useQuery<User>({
    queryKey: ["profile"],
    queryFn: authApi.getProfile,
    enabled: tokenExists, // Only fetch if token exists
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Register mutation
export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: (response) => {
      localStorage.setItem("token", response.accessToken);
      queryClient.setQueryData(["profile"], response.user);
      toast.success("Registrasi berhasil!");
      router.push("/");
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      const message = error.response?.data?.error || "Registrasi gagal";
      toast.error(message);
    },
  });
}

// Login mutation
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: (response) => {
      localStorage.setItem("token", response.accessToken);
      queryClient.setQueryData(["profile"], response.user);
      toast.success("Login berhasil!");
      // Redirect based on role
      if (response.user.role === 'admin') {
        router.push("/admin");
      } else {
        router.push("/");
      }
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      const message = error.response?.data?.error || "Login gagal";
      toast.error(message);
    },
  });
}

// Logout
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    localStorage.removeItem("token");
    queryClient.removeQueries({ queryKey: ["profile"] });
    queryClient.clear();
    toast.success("Logout berhasil");
    router.push("/");
  };
}
