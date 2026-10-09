import Link from "next/link";
import { list } from "@/src/features/content/api";
import { BlogPost, Locale } from "@/src/features/content/types";
import { Media } from "@/src/features/content/Media";
import { ui } from "@/src/features/i18n/ui";
import type { Metadata } from "next";
import { seoCopy } from "@/src/features/seo/copy";
import { pageMetadata } from "@/src/features/seo/site";

type BlogPageProps = { params: Promise<{ lang: Locale }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params, searchParams }: BlogPageProps): Promise<Metadata> {
  const { lang } = await params;
  const { page: requestedPage } = await searchParams;
  const page = Math.max(1, Number.parseInt(requestedPage || "1", 10) || 1);
  const result = await list<BlogPost>("blog", lang, { page: String(page), limit: "12" });
  return pageMetadata({
    lang, path: `/blog${page > 1 ? `?page=${page}` : ""}`,
    title: `${ui(lang).blog}${page > 1 ? ` — ${page}` : ""}`,
    description: seoCopy(lang).blogDescription,
    noindex: !result.error && !result.items.length,
  });
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { lang } = await params;
  const { page: requestedPage } = await searchParams;
  const page = Math.max(1, Number.parseInt(requestedPage || "1", 10) || 1);
  const t = ui(lang);
  const result = await list<BlogPost>("blog", lang, { page: String(page), limit: "12" });
  return <div className="container mx-auto px-4 py-12 md:py-20"><h1 className="text-4xl md:text-5xl mb-12">{t.blog}</h1>{result.error ? <p>{t.unavailable}</p> : !result.items.length ? <p>{t.empty}</p> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{result.items.map((post) => <Link href={`/${lang}/blog/${post.slug}`} key={post.id} className="group"><Media src={post.image} alt={post.title} className="aspect-[4/3] rounded-2xl" /><p className="text-sm text-textSecondary mt-4">{new Intl.DateTimeFormat(lang === "tm" ? "tk" : lang, { dateStyle: "medium" }).format(new Date(post.publishedAt))}</p><h2 className="mt-2 text-2xl group-hover:underline">{post.title} ↗</h2><p className="mt-3 line-clamp-3 text-textSecondary">{post.text}</p></Link>)}</div>}{result.total > 12 && <nav className="flex justify-center gap-5 mt-14">{page > 1 && <Link href={`/${lang}/blog?page=${page - 1}`} className="rounded-full bg-[#f3f5f7] px-5 py-3">← {t.previous}</Link>}<span className="px-5 py-3">{page} / {Math.ceil(result.total / 12)}</span>{page * 12 < result.total && <Link href={`/${lang}/blog?page=${page + 1}`} className="rounded-full bg-[#f3f5f7] px-5 py-3">{t.next} →</Link>}</nav>}</div>;
}
