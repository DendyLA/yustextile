import Link from "next/link";
import { list, listAll, site } from "@/src/features/content/api";
import { About, BlogPost, Complex, Faq, Locale, Partner, Product, Promo } from "@/src/features/content/types";
import { PartnerMarquee } from "@/src/features/partners/PartnerMarquee";
import { Media } from "@/src/features/content/Media";
import { Section } from "@/src/features/content/Section";
import { ProductCard } from "@/src/features/products/ProductCard";
import { ui } from "@/src/features/i18n/ui";
import { PromoCarousel } from "@/src/features/promo/PromoCarousel";
import { ComplexCard } from "@/src/features/production/ComplexCard";
import type { Metadata } from "next";
import { seoCopy } from "@/src/features/seo/copy";
import { pageMetadata } from "@/src/features/seo/site";
import { JsonLd } from "@/src/features/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/src/features/seo/schema";
import type { Contact } from "@/src/features/content/types";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const promos = await list<Promo>("promos", lang, { limit: "1" });
  const copy = seoCopy(lang);
  return {
    ...pageMetadata({ lang, path: "", title: copy.homeTitle, description: copy.homeDescription, image: promos.items[0]?.images[0] }),
    title: { absolute: copy.homeTitle },
  };
}

export default async function Home({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = ui(lang);
  const [promos, products, about, partners, complexes, faqs, blog, contact] = await Promise.all([
    list<Promo>("promos", lang, { limit: "6" }), list<Product>("products", lang, { recommended: "true", limit: "8" }),
    site<About>("about", lang), list<Partner>("partners", lang, { limit: "30" }),
    list<Complex>("complexes", lang, { limit: "3" }), listAll<Faq>("faqs", lang), list<BlogPost>("blog", lang, { limit: "3" }), site<Contact>("contact", lang),
  ]);
  return <>
    <JsonLd data={organizationSchema(contact)} />
    <JsonLd data={websiteSchema(lang)} />
    <PromoCarousel promos={promos.items} lang={lang} />
    <Section title={t.recommended} href={`/${lang}/products`} lang={lang}>{products.error ? <p>{t.unavailable}</p> : products.items.length ? <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">{products.items.map((product) => <ProductCard key={product.id} product={product} lang={lang} />)}</div> : <p>{t.empty}</p>}</Section>
    {about && <section className="bg-[#f3f5f7] py-20"><div className="container mx-auto px-4 grid md:grid-cols-2 gap-10 items-center"><div><span className="text-sm uppercase tracking-wide">{t.about}</span><h2 className="text-3xl md:text-5xl mt-5 mb-6">{about.title}</h2><p className="text-textSecondary whitespace-pre-line line-clamp-6">{about.text}</p><Link href={`/${lang}/about`} className="defaultButton mt-8 w-max bg-primary text-white">{t.details} ↗</Link></div><Media src="/images/aboutUs/towel.webp" alt={about.title} className="aspect-[4/3] rounded-3xl" /></div></section>}
    {!!partners.items.length && <div className="container mx-auto px-4 py-14"><PartnerMarquee partners={partners.items} label={t.partners} /></div>}
    {!!complexes.items.length && <Section title={t.production} href={`/${lang}/production`} lang={lang}><div className="grid md:grid-cols-3 gap-5">{complexes.items.map((item) => <ComplexCard key={item.id} complex={item} lang={lang} />)}</div></Section>}
    {!!blog.items.length && <Section title={t.blog} href={`/${lang}/blog`} lang={lang}><div className="grid md:grid-cols-3 gap-5">{blog.items.map((post) => <Link href={`/${lang}/blog/${post.slug}`} key={post.id} className="group"><Media src={post.image} alt={post.title} className="aspect-[4/3] rounded-2xl" /><h3 className="mt-4 text-xl group-hover:underline">{post.title} ↗</h3></Link>)}</div></Section>}
    <Section title={t.faq} id="faq" lang={lang}><div className="max-w-3xl mx-auto">{faqs.error ? <p>{t.unavailable}</p> : faqs.items.length ? faqs.items.map((faq) => <details key={faq.id} className="border-b py-5"><summary className="cursor-pointer text-xl">{faq.question}</summary><p className="pt-4 text-textSecondary">{faq.answer}</p></details>) : <p>{t.empty}</p>}</div></Section>
  </>;
}
