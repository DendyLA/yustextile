import { list, site } from "@/src/features/content/api";
import { About, AboutBlock, Locale, Partner } from "@/src/features/content/types";
import { Media } from "@/src/features/content/Media";
import { PartnerMarquee } from "@/src/features/partners/PartnerMarquee";
import { ui } from "@/src/features/i18n/ui";
import type { Metadata } from "next";
import { seoCopy } from "@/src/features/seo/copy";
import { pageMetadata } from "@/src/features/seo/site";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const about = await site<About>("about", lang);
  return pageMetadata({ lang, path: "/about", title: about?.title || ui(lang).about, description: about?.text || seoCopy(lang).aboutDescription });
}

export default async function AboutPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const [about, blocks, partners] = await Promise.all([site<About>("about", lang), list<AboutBlock>("about-blocks", lang, { limit: "100" }), list<Partner>("partners", lang, { limit: "100" })]);
  const t = ui(lang);
  return <div className="container mx-auto px-4 py-12 md:py-20"><p className="uppercase tracking-wide text-textSecondary mb-4">{t.about}</p><h1 className="text-4xl md:text-5xl mb-8">{about?.title || t.about}</h1>{about ? <p className="max-w-4xl text-xl text-textSecondary whitespace-pre-line mb-16">{about.text}</p> : <p>{t.unavailable}</p>}{blocks.items.map((block, index) => <section key={block.id} className="grid md:grid-cols-2 gap-10 items-center py-10 border-t"><div className={index % 2 ? "md:order-2" : ""}>{block.image && <Media src={block.image} alt={block.title} className="aspect-[4/3] rounded-3xl" />}</div><div><h2 className="text-3xl mb-5">{block.title}</h2>{block.lead && <p className="text-xl mb-4">{block.lead}</p>}<p className="whitespace-pre-line text-textSecondary">{block.text}</p></div></section>)}{!!partners.items.length && <section className="py-16"><h2 className="text-3xl mb-8">{t.partners}</h2><PartnerMarquee partners={partners.items} label={t.partners} /></section>}</div>;
}
