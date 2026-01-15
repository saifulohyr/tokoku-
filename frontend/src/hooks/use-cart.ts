"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/schemas/order";
import type { Product } from "@/lib/schemas/product";

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((item) => item.productId === product.id);
          
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id
                  ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
                  : item
              ),
            };
          }
          
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: Math.min(quantity, product.stock),
                imageUrl: product.imageUrl,
                stock: product.stock,
              },
            ],
          };
        });
      },
      
      removeItem: (productId: number) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },
      
      updateQuantity: (productId: number, quantity: number) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
              : item
          ),
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    }),
    {
      name: "tokoku-cart",
    }
  )
);
