// Auth API Functions
import { api, extractData, type ApiResponse } from "./client";
import type { RegisterInput, LoginInput, AuthResponse, User } from "../schemas/auth";

export async function register(data: RegisterInput): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse>>("/auth/register", data);
  return extractData(response);
}

export async function login(data: LoginInput): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", data);
  return extractData(response);
}

export async function getProfile(): Promise<User> {
  const response = await api.get<ApiResponse<User>>("/auth/profile");
  return extractData(response);
}
