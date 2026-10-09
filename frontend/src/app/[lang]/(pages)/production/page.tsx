import { list } from "@/src/features/content/api";
import { Complex, Locale } from "@/src/features/content/types";
import { ui } from "@/src/features/i18n/ui";
import { ComplexCard } from "@/src/features/production/ComplexCard";
import type { Metadata } from "next";
import { seoCopy } from "@/src/features/seo/copy";
import { pageMetadata } from "@/src/features/seo/site";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata({ lang, path: "/production", title: ui(lang).production, description: seoCopy(lang).productionDescription });
}

export default async function ProductionPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = ui(lang);
  const result = await list<Complex>("complexes", lang, { limit: "100" });
  return <div className="container mx-auto px-4 py-12 md:py-20"><h1 className="text-4xl md:text-5xl mb-12">{t.production}</h1>{result.error ? <p>{t.unavailable}</p> : !result.items.length ? <p>{t.empty}</p> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{result.items.map((complex) => <ComplexCard key={complex.id} complex={complex} lang={lang} />)}</div>}</div>;
}
