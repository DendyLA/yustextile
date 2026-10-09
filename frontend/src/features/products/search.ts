import type { Product } from "@/src/features/content/types";

export function searchTerm(value?: string | string[]) {
  const text = Array.isArray(value) ? value[0] : value;
  return (text || "").trim().replace(/\s+/g, " ").slice(0, 100);
}

export function productSearchScore(product: Product, query: string): number {
  const term = searchTerm(query).toLocaleLowerCase();
  if (!term) return -1;

  const title = product.title.toLocaleLowerCase();
  const category = product.category?.title?.toLocaleLowerCase() || "";
  const manufacturer = product.manufacturer?.toLocaleLowerCase() || "";
  const details = [product.text, ...product.specs.flatMap((spec) => [spec.name, spec.value])].join(" ").toLocaleLowerCase();
  const searchable = `${title} ${category} ${manufacturer} ${details}`;
  const words = term.split(" ");
  if (!words.every((word) => searchable.includes(word))) return -1;

  if (title === term) return 100;
  if (title.startsWith(term)) return 80;
  if (title.includes(term)) return 60;
  if (words.every((word) => title.includes(word))) return 50;
  if (category.includes(term)) return 30;
  if (manufacturer.includes(term)) return 20;
  return 10;
}

export function rankedProducts(products: Product[], query: string) {
  return products
    .map((product) => ({ product, score: productSearchScore(product, query) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score || a.product.title.localeCompare(b.product.title))
    .map(({ product }) => product);
}
