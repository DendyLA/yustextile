"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "../content/types";

export type CartItem = { productId: string; slug: string; title: string; image: string; quantity: number };
type CartState = { items: CartItem[]; add: (product: Product) => void; remove: (id: string) => void; setQuantity: (id: string, quantity: number) => void; clear: () => void };

export const useCart = create<CartState>()(persist((set) => ({
  items: [],
  add: (product) => set((state) => {
    const existing = state.items.find((item) => item.productId === product.id);
    return { items: existing
      ? state.items.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...state.items, { productId: product.id, slug: product.slug, title: product.title, image: product.images[0] || "", quantity: 1 }] };
  }),
  remove: (id) => set((state) => ({ items: state.items.filter((item) => item.productId !== id) })),
  setQuantity: (id, quantity) => set((state) => ({ items: state.items.map((item) => item.productId === id ? { ...item, quantity: Math.max(1, Math.min(100000, Math.floor(quantity || 1))) } : item) })),
  clear: () => set({ items: [] }),
}), { name: "yustextile-cart", skipHydration: true }));
