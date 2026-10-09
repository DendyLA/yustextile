import { NextRequest, NextResponse } from "next/server";
import { listAll } from "@/src/features/content/api";
import type { Locale, Product } from "@/src/features/content/types";
import { rankedProducts, searchTerm } from "@/src/features/products/search";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const langParam = searchParams.get("lang");
  const lang: Locale = langParam === "tm" || langParam === "en" ? langParam : "ru";
  const q = searchTerm(searchParams.get("q") || "");
  const category = searchParams.get("category")?.slice(0, 100) || "";

  if (!q) return NextResponse.json({ items: [] });

  const result = await listAll<Product>("products", lang, category ? { categorySlug: category } : {});
  if (result.error) return NextResponse.json({ items: [] }, { status: 503 });

  const items = rankedProducts(result.items, q).slice(0, 6).map((product) => ({
    id: product.id,
    slug: product.slug,
    title: product.title,
    image: product.images[0] || null,
    manufacturer: product.manufacturer,
  }));
  return NextResponse.json({ items });
}
