import Link from "next/link";
import { Product, Locale } from "../content/types";
import { Media } from "../content/Media";
import { ui } from "../i18n/ui";
import { AddToCart } from "../cart/AddToCart";

export function ProductCard({ product, lang }: { product: Product; lang: Locale }) {
  const t = ui(lang);
  return <article className="group flex flex-col gap-4">
    <Link href={`/${lang}/products/${product.slug}`} className="relative block overflow-hidden rounded-2xl text-left"><Media src={product.images[0]} alt={product.title} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="aspect-square group-hover:scale-[1.03] duration-500" /><span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-2 text-sm text-primary backdrop-blur-sm">{t.details} ↗</span></Link>
    <div className="flex flex-col gap-2 grow">
      <Link href={`/${lang}/products/${product.slug}`} className="text-lg leading-tight hover:underline">{product.title}</Link>
      {product.manufacturer && <span className="text-sm text-textSecondary">{product.manufacturer}</span>}
      {product.priceLabel && <span className="text-sm text-textSecondary">{t.price}: {product.priceLabel}</span>}
    </div>
    <AddToCart product={product} lang={lang} />
  </article>;
}
