"use client";
import { useState } from "react";
import { Product, Locale } from "../content/types";
import { ui } from "../i18n/ui";
import { useCart } from "./store";

export function AddToCart({ product, lang }: { product: Product; lang: Locale }) {
  const add = useCart((state) => state.add);
  const [added, setAdded] = useState(false);
  return <button type="button" className="defaultButton bg-primary text-white hover:bg-[#004a45] duration-300" onClick={() => { add(product); setAdded(true); window.setTimeout(() => setAdded(false), 2000); }}>{added ? ui(lang).added : ui(lang).addToCart}</button>;
}
