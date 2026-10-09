import Link from "next/link";
import type { Metadata } from "next";
import { categoryTree, list, listAll } from "@/src/features/content/api";
import { Category, Locale, Product } from "@/src/features/content/types";
import { ProductCard } from "@/src/features/products/ProductCard";
import { ProductSearch } from "@/src/features/products/ProductSearch";
import { rankedProducts, searchTerm } from "@/src/features/products/search";
import { ui } from "@/src/features/i18n/ui";
import { seoCopy } from "@/src/features/seo/copy";
import { pageMetadata } from "@/src/features/seo/site";

const PAGE_SIZE = 24;

function flatten(categories: Category[]): Category[] {
  return categories.flatMap((category) => [category, ...flatten(category.children || [])]);
}

type ProductsPageProps = {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ category?: string; page?: string; q?: string | string[] }>;
};

export async function generateMetadata({ params, searchParams }: ProductsPageProps): Promise<Metadata> {
  const { lang } = await params;
  const { category = "", page: requestedPage, q: requestedSearch } = await searchParams;
  const q = searchTerm(requestedSearch);
  const page = Math.max(1, Number.parseInt(requestedPage || "1", 10) || 1);
  const categories = category ? flatten(await categoryTree(lang)) : [];
  const selected = categories.find((item) => item.slug === category);
  const t = ui(lang);
  const query = new URLSearchParams({ ...(category ? { category } : {}), ...(q ? { q } : {}), ...(page > 1 ? { page: String(page) } : {}) });
  const path = `/products${query.size ? `?${query}` : ""}`;
  const title = `${q ? t.searchProducts : selected?.title || t.allProducts}${page > 1 ? ` — ${page}` : ""}`;
  return pageMetadata({
    lang, path, title,
    description: selected ? `${selected.title}. ${seoCopy(lang).productsDescription}` : seoCopy(lang).productsDescription,
    noindex: !!q || (!!category && !selected),
  });
}

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
  const { lang } = await params;
  const query = await searchParams;
  const page = Math.max(1, Number.parseInt(query.page || "1", 10) || 1);
  const category = query.category || "";
  const q = searchTerm(query.q);
  const filters: Record<string, string> = category ? { categorySlug: category } : {};
  const [tree, apiResult] = await Promise.all([
    categoryTree(lang),
    q ? listAll<Product>("products", lang, filters) : list<Product>("products", lang, { ...filters, page: String(page), limit: String(PAGE_SIZE) }),
  ]);
  const t = ui(lang);
  const categories = flatten(tree);
  const matching = q ? rankedProducts(apiResult.items, q) : apiResult.items;
  const total = q ? matching.length : apiResult.total;
  const products = q ? matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : matching;
  const catalogUrl = (selectedCategory = category, pageNumber?: number) => {
    const params = new URLSearchParams({ ...(selectedCategory ? { category: selectedCategory } : {}), ...(q ? { q } : {}), ...(pageNumber && pageNumber > 1 ? { page: String(pageNumber) } : {}) });
    return `/${lang}/products${params.size ? `?${params}` : ""}`;
  };

  return <div className="container mx-auto px-4 py-12 md:py-20">
    <h1 className="mb-8 text-4xl md:text-5xl">{t.allProducts}</h1>
    <ProductSearch key={`${q}-${category}`} lang={lang} query={q} category={category} />
    <nav aria-label={t.category} className="mb-8 mt-10 flex flex-wrap gap-2">
      <Link href={catalogUrl("")} className={`rounded-full px-5 py-3 ${!category ? "bg-primary text-white" : "bg-[#f3f5f7]"}`}>{t.allCategories}</Link>
      {categories.map((item) => <Link key={item.id} href={catalogUrl(item.slug)} className={`rounded-full px-5 py-3 ${category === item.slug ? "bg-primary text-white" : "bg-[#f3f5f7]"}`}>{item.title} {item.productCount != null && `(${item.productCount})`}</Link>)}
    </nav>
    {q && <p role="status" className="mb-8 text-textSecondary">{t.searchResults}: {total}</p>}
    {apiResult.error ? <p>{t.unavailable}</p> : products.length ? <div className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-8 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} lang={lang} />)}</div> : <p>{q ? t.noSearchResults : t.empty}</p>}
    {total > PAGE_SIZE && <nav aria-label="Pages" className="mt-14 flex justify-center gap-4">
      {page > 1 && <Link href={catalogUrl(category, page - 1)} className="rounded-full bg-[#f3f5f7] px-5 py-3">← {t.previous}</Link>}
      <span className="px-5 py-3">{page} / {Math.ceil(total / PAGE_SIZE)}</span>
      {page * PAGE_SIZE < total && <Link href={catalogUrl(category, page + 1)} className="rounded-full bg-[#f3f5f7] px-5 py-3">{t.next} →</Link>}
    </nav>}
  </div>;
}
