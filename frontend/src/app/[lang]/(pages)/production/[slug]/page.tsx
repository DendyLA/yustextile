import Link from "next/link";
import { notFound } from "next/navigation";
import { one } from "@/src/features/content/api";
import { Complex, Locale } from "@/src/features/content/types";
import { Media } from "@/src/features/content/Media";
import { ui } from "@/src/features/i18n/ui";
import type { Metadata } from "next";
import { pageMetadata, pageUrl } from "@/src/features/seo/site";
import { JsonLd } from "@/src/features/seo/JsonLd";
import { breadcrumbSchema } from "@/src/features/seo/schema";

type ComplexPageProps = { params: Promise<{ lang: Locale; slug: string }> };

export async function generateMetadata({ params }: ComplexPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const complex = await one<Complex>("complexes", slug, lang);
  if (!complex) notFound();
  return pageMetadata({ lang, path: `/production/${slug}`, title: complex.title, description: complex.text, image: complex.image });
}

export default async function ComplexPage({ params }: ComplexPageProps) {
  const { lang, slug } = await params;
  const complex = await one<Complex>("complexes", slug, lang);
  if (!complex) notFound();
  const t = ui(lang);
  return (
    <article className="container mx-auto max-w-7xl px-4 py-12 md:py-20">
      <JsonLd data={breadcrumbSchema([
        { name: t.home, url: pageUrl(lang) },
        { name: t.production, url: pageUrl(lang, "/production") },
        { name: complex.title, url: pageUrl(lang, `/production/${slug}`) },
      ])} />
      <Link href={`/${lang}/production`} className="inline-flex items-center gap-2 text-sm text-textSecondary hover:text-primary hover:underline">← {t.production}</Link>

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-2 lg:gap-14">
        <Media
          src={complex.image}
          alt={complex.title}
          sizes="(max-width: 1024px) 100vw, 560px"
          priority
          fit="contain"
          className="aspect-square w-full rounded-3xl ring-1 ring-primary/10"
        />

        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-textSecondary">{t.production}</p>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight md:text-4xl xl:text-5xl">{complex.title}</h1>
          {complex.foundedYear && <p className="mt-7 inline-flex rounded-full bg-[#f3f5f7] px-4 py-2 text-sm text-textSecondary">{t.founded}: {complex.foundedYear}</p>}
          <p className="mt-6 max-w-2xl whitespace-pre-line border-t border-primary/10 pt-6 text-base leading-relaxed text-textSecondary md:text-lg">{complex.text}</p>
        </div>
      </div>
    </article>
  );
}
