"use client";
import { useEffect } from "react";
import { useCart } from "./store";
export function CartHydration() {
  useEffect(() => { void useCart.persist.rehydrate(); }, []);
  return null;
}
