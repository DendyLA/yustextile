"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Contact, Catalog, Locale } from "../features/content/types";
import { assetUrl } from "../features/content/assets";
import { ui } from "../features/i18n/ui";
import { BrandLogo } from "./BrandLogo";

export function SiteFooter({ lang, contact, catalog }: { lang: Locale; contact: Contact | null; catalog: Catalog | null }) {
  const t = ui(lang);
  const [status, setStatus] = useState("");
  const pdf = catalog?.[lang === "tm" ? "pdfTk" : lang === "ru" ? "pdfRu" : "pdfEn"];
  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = new FormData(form).get("email");
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
      if (!response.ok) throw new Error();
      form.reset(); setStatus(t.subscribed);
    } catch { setStatus(t.failure); }
  }
  return <footer id="contacts" className="bg-primary text-white px-4 py-16">
    <div className="container mx-auto grid gap-12 md:grid-cols-3">
      <div><Link href={`/${lang}`} aria-label="Yustextile"><BrandLogo /></Link><p className="text-white/70 whitespace-pre-line">{contact?.address}</p></div>
      <div><h3 className="text-xl mb-5">{t.contacts}</h3><div className="flex flex-col gap-3">{contact?.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}{contact?.phone && <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a>}{contact?.whatsapp && <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}>WhatsApp: {contact.whatsapp}</a>}{pdf && <a className="text-secondary" href={assetUrl(pdf)} target="_blank" rel="noreferrer">{t.catalog} ↗</a>}</div></div>
      <div><h3 className="text-xl mb-5">{t.newsletter}</h3><form onSubmit={subscribe} className="flex gap-2"><input name="email" type="email" required aria-label={t.email} placeholder={t.email} className="min-w-0 flex-1 rounded-full bg-white px-4 py-3 text-primary" /><button className="rounded-full bg-secondary px-5 py-3 text-primary">{t.subscribe}</button></form><p role="status" className="mt-3 text-sm">{status}</p></div>
    </div>
    <div className="container mx-auto mt-16 border-t border-white/20 pt-5 flex justify-between"><span>© {new Date().getFullYear()} Yustextile</span><Link href={`/${lang}/products`}>{t.products} ↗</Link></div>
  </footer>;
}
