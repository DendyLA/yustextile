import type { MetadataRoute } from "next";
import { categoryTree, listAll } from "@/src/features/content/api";
import type { BlogPost, Category, Complex, Locale, Product } from "@/src/features/content/types";
import { alternateLanguages, imageUrl, locales, pageUrl } from "@/src/features/seo/site";

export const revalidate = 3600;

function flatten(categories: Category[]): Category[] {
  return categories.flatMap((category) => [category, ...flatten(category.children || [])]);
}

function entries(path: string, options: { lastModified?: string; images?: string[] } = {}): MetadataRoute.Sitemap {
  return locales.map((lang: Locale) => ({
    url: pageUrl(lang, path),
    alternates: { languages: alternateLanguages(path) },
    ...(options.lastModified ? { lastModified: options.lastModified } : {}),
    ...(options.images?.length ? { images: options.images } : {}),
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, blog, complexes, categories] = await Promise.all([
    listAll<Product>("products", "en"),
    listAll<BlogPost>("blog", "en"),
    listAll<Complex>("complexes", "en"),
    categoryTree("en"),
  ]);

  return [
    ...entries(""),
    ...entries("/products"),
    ...entries("/about"),
    ...entries("/production"),
    ...entries("/contacts"),
    ...(blog.total > 0 || blog.error ? entries("/blog") : []),
    ...flatten(categories).filter((category) => (category.productCount || 0) > 0).map((category) => `/products?category=${encodeURIComponent(category.slug)}`).flatMap((path) => entries(path)),
    ...products.items.flatMap((product) => entries(`/products/${product.slug}`, {
      lastModified: product.updatedAt,
      images: product.images.map(imageUrl),
    })),
    ...complexes.items.flatMap((complex) => entries(`/production/${complex.slug}`, {
      lastModified: complex.updatedAt,
      images: [imageUrl(complex.image)],
    })),
    ...blog.items.flatMap((post) => entries(`/blog/${post.slug}`, {
      lastModified: post.updatedAt || post.publishedAt,
      images: [imageUrl(post.image)],
    })),
  ];
}
