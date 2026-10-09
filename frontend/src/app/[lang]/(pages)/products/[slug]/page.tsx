import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { one } from "@/src/features/content/api";
import { Product, Locale } from "@/src/features/content/types";
import { ProductGallery } from "@/src/features/products/ProductGallery";
import { AddToCart } from "@/src/features/cart/AddToCart";
import { ui } from "@/src/features/i18n/ui";
import { pageMetadata, pageUrl } from "@/src/features/seo/site";
import { JsonLd } from "@/src/features/seo/JsonLd";
import { breadcrumbSchema, productSchema } from "@/src/features/seo/schema";

type ProductPageProps = { params: Promise<{ lang: Locale; slug: string }> };

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const product = await one<Product>("products", slug, lang);
  if (!product) notFound();
  return pageMetadata({ lang, path: `/products/${slug}`, title: product.title, description: product.text, image: product.images[0] });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { lang, slug } = await params;
  const product = await one<Product>("products", slug, lang);
  if (!product) notFound();
  const t = ui(lang);

  return <div className="container mx-auto px-4 py-12 md:py-20">
    <JsonLd data={productSchema(product, lang)} />
    <JsonLd data={breadcrumbSchema([
      { name: t.home, url: pageUrl(lang) },
      { name: t.allProducts, url: pageUrl(lang, "/products") },
      ...(product.category ? [{ name: product.category.title, url: pageUrl(lang, `/products?category=${encodeURIComponent(product.category.slug)}`) }] : []),
      { name: product.title, url: pageUrl(lang, `/products/${slug}`) },
    ])} />
    <Link href={`/${lang}/products`} className="text-textSecondary hover:underline">← {t.allProducts}</Link>
    <div className="mt-10 grid gap-12 md:grid-cols-2">
      <ProductGallery images={product.images} title={product.title} lang={lang} />
      <div>
        <p className="mb-4 text-sm text-textSecondary">{product.category?.title}</p>
        <h1 className="mb-6 text-4xl md:text-5xl">{product.title}</h1>
        <p className="mb-8 whitespace-pre-line text-textSecondary">{product.text}</p>
        <dl className="mb-9">
          {[[t.manufacturer, product.manufacturer], [t.price, product.priceLabel], [t.minimumOrder, product.minimumOrder], ...product.specs.map((spec) => [spec.name, spec.value])].filter((row) => row[1]).map(([name, value], index) => <div key={index} className="grid grid-cols-2 gap-5 border-b py-4"><dt className="text-textSecondary">{name}</dt><dd>{value}</dd></div>)}
        </dl>
        <AddToCart product={product} lang={lang} />
      </div>
    </div>
  </div>;
}
