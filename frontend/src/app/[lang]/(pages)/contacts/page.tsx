import Link from "next/link";
import { site } from "@/src/features/content/api";
import { Contact, Locale } from "@/src/features/content/types";
import { ui } from "@/src/features/i18n/ui";
import type { Metadata } from "next";
import { seoCopy } from "@/src/features/seo/copy";
import { pageMetadata } from "@/src/features/seo/site";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata({ lang, path: "/contacts", title: ui(lang).contacts, description: seoCopy(lang).contactsDescription });
}

export default async function ContactsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = ui(lang);
  const contact = await site<Contact>("contact", lang);
  const mapQuery = contact?.address?.trim();
  const mapSearch = mapQuery ? encodeURIComponent(mapQuery) : null;
  return <div className="container mx-auto px-4 py-12 md:py-20">
    <h1 className="text-4xl md:text-5xl mb-12">{t.contacts}</h1>
    {contact ? <div className="grid md:grid-cols-2 gap-10">
      <div className="rounded-3xl bg-[#f3f5f7] p-8"><h2 className="text-2xl mb-5">{t.address}</h2><p className="text-xl whitespace-pre-line">{contact.address}</p></div>
      <div className="rounded-3xl bg-primary text-white p-8 flex flex-col gap-5"><h2 className="text-2xl">{t.contacts}</h2><a href={`mailto:${contact.email}`} className="text-xl hover:underline">{contact.email}</a><a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="text-xl hover:underline">{contact.phone}</a><a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`} className="text-xl hover:underline">WhatsApp: {contact.whatsapp}</a>{contact.telegramPhone && <span>Telegram: {contact.telegramPhone}</span>}</div>
    </div> : <p>{t.unavailable}</p>}
    {mapSearch && <section className="mt-12 md:mt-16" aria-labelledby="contact-map-title">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="contact-map-title" className="text-3xl md:text-4xl">{t.map}</h2>
          <p className="mt-2 text-textSecondary">{contact?.address}</p>
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${mapSearch}`}
          target="_blank"
          rel="noopener noreferrer"
          className="defaultButton bg-secondary"
        >{t.openMap} ↗</a>
      </div>
      <div className="overflow-hidden rounded-3xl bg-[#f3f5f7] shadow-sm">
        <iframe
          title={`${t.map}: ${contact?.address}`}
          src={`https://maps.google.com/maps?q=${mapSearch}&z=16&output=embed`}
          className="h-[360px] w-full border-0 md:h-[480px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </section>}
    <Link href={`/${lang}/products`} className="defaultButton w-max mt-10 bg-secondary">{t.allProducts} ↗</Link>
  </div>;
}
