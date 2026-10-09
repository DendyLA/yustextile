"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "./BrandLogo";
import { Locale } from "../features/content/types";
import { ui } from "../features/i18n/ui";
import { useCart } from "../features/cart/store";

export function SiteHeader({ lang }: { lang: Locale }) {
  const t = ui(lang);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const count = useCart((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const links = [[t.home, `/${lang}`], [t.products, `/${lang}/products`], [t.about, `/${lang}/about`], [t.production, `/${lang}/production`], [t.blog, `/${lang}/blog`], [t.contacts, `/${lang}/contacts`]];
  const languagePath = (next: Locale) => pathname.replace(/^\/(tm|ru|en)(?=\/|$)/, `/${next}`);
  return <header className="sticky top-0 z-50 bg-primary text-white shadow-lg">
    <div className="container mx-auto flex min-h-20 items-center justify-between gap-5 px-4 py-4 md:py-5">
      <Link href={`/${lang}`} aria-label="Yustextile"><BrandLogo compactOnMobile /></Link>
      <nav className="hidden xl:flex items-center gap-6 text-sm">{links.map(([label, href]) => <Link key={href} href={href} className={pathname === href ? "text-secondary" : "hover:text-secondary"}>{label}</Link>)}</nav>
      <div className="flex items-center gap-3 md:gap-5">
        <Link href={`/${lang}/cart`} onClick={() => setOpen(false)} className="relative rounded-full border border-white/30 px-4 py-2 hover:bg-white/10">{t.cart} <span aria-label={`${count}`}>({count})</span></Link>
        <div className="flex gap-1 text-xs">{(["tm", "ru", "en"] as Locale[]).map((code) => <Link key={code} href={languagePath(code)} onClick={() => { document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000`; }} className={`uppercase px-1 ${lang === code ? "text-secondary underline" : "text-white/70 hover:text-white"}`}>{code}</Link>)}</div>
        <button type="button" className="xl:hidden text-2xl" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "×" : "☰"}</button>
      </div>
    </div>
    {open && <nav className="xl:hidden container mx-auto flex flex-col px-4 pb-5">{links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="border-t border-white/15 py-3">{label}</Link>)}</nav>}
  </header>;
}
