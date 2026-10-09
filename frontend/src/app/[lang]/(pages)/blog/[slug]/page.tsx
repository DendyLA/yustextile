import Link from "next/link";
import { notFound } from "next/navigation";
import { one } from "@/src/features/content/api";
import { BlogPost, Locale } from "@/src/features/content/types";
import { Media } from "@/src/features/content/Media";
import { ui } from "@/src/features/i18n/ui";
import type { Metadata } from "next";
import { pageMetadata, pageUrl } from "@/src/features/seo/site";
import { JsonLd } from "@/src/features/seo/JsonLd";
import { blogPostSchema, breadcrumbSchema } from "@/src/features/seo/schema";

type BlogPostPageProps = { params: Promise<{ lang: Locale; slug: string }> };

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const post = await one<BlogPost>("blog", slug, lang);
  if (!post) notFound();
  return pageMetadata({
    lang, path: `/blog/${slug}`, title: post.title, description: post.text, image: post.image,
    article: { publishedTime: post.publishedAt, modifiedTime: post.updatedAt },
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { lang, slug } = await params;
  const post = await one<BlogPost>("blog", slug, lang);
  if (!post) notFound();
  const t = ui(lang);
  return <article className="container mx-auto max-w-[704px] px-4 py-12 md:py-20"><JsonLd data={blogPostSchema(post, lang)} /><JsonLd data={breadcrumbSchema([{ name: t.home, url: pageUrl(lang) }, { name: t.blog, url: pageUrl(lang, "/blog") }, { name: post.title, url: pageUrl(lang, `/blog/${slug}`) }])} /><Link href={`/${lang}/blog`} className="text-textSecondary hover:underline">← {t.blog}</Link><p className="mt-10 text-sm text-textSecondary">{new Intl.DateTimeFormat(lang === "tm" ? "tk" : lang, { dateStyle: "long" }).format(new Date(post.publishedAt))}</p><h1 className="my-8 text-4xl md:text-5xl">{post.title}</h1><Media src={post.image} alt={post.title} sizes="(max-width: 704px) 100vw, 672px" priority fit="natural" /><div className="mt-12 whitespace-pre-line text-lg leading-relaxed">{post.text}</div></article>;
}
