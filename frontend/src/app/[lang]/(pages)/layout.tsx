import { ReactNode } from "react";
import { SiteHeader } from "@/src/components/SiteHeader";
import { SiteFooter } from "@/src/components/SiteFooter";
import { CartHydration } from "@/src/features/cart/CartHydration";
import { list, site } from "@/src/features/content/api";
import { Catalog, Contact, Locale } from "@/src/features/content/types";
import { isLocale } from "@/src/features/i18n/ui";
import { notFound } from "next/navigation";

export default async function PagesLayout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const lang: Locale = raw;
  const [contact, catalogs] = await Promise.all([site<Contact>("contact", lang), list<Catalog>("catalogs", lang, { limit: "1" })]);
  return <><CartHydration /><SiteHeader lang={lang} /><main className="min-h-[65vh]">{children}</main><SiteFooter lang={lang} contact={contact} catalog={catalogs.items[0] || null} /></>;
}
