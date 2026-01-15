import axios from "axios";

// Ensure no trailing slash
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "");

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    console.log("[API Debug] Request to:", config.baseURL, config.url);
    console.log("[API Debug] Token exists:", !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle errors globally - but DON'T redirect automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only clear token on 401, don't redirect
    // Let the component handle the redirect logic
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    }
    return Promise.reject(error);
  }
);

// Standard API Response structure
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Helper to extract data from standardized response
// Expects AxiosResponse where data is ApiResponse<T>
export function extractData<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}
