"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { assetUrl } from "../content/assets";
import type { Locale } from "../content/types";
import { ui } from "../i18n/ui";

type Props = { lang: Locale; query?: string; category?: string; hero?: boolean };
type Suggestion = { id: string; slug: string; title: string; image: string | null; manufacturer: string | null };
type Status = "idle" | "loading" | "ready" | "error";

const loadingLabel: Record<Locale, string> = {
  ru: "Ищем товары…",
  en: "Searching products…",
  tm: "Önümler gözlenýär…",
};

export function ProductSearch({ lang, query = "", category, hero = false }: Props) {
  const t = ui(lang);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [value, setValue] = useState(query);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const term = value.trim().replace(/\s+/g, " ");
  const visible = open && term.length > 0;
  const inputId = hero ? "hero-product-search" : "catalog-product-search";
  const listId = `${inputId}-suggestions`;

  useEffect(() => {
    if (!visible) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const params = new URLSearchParams({ lang, q: term, ...(category ? { category } : {}) });
      try {
        const response = await fetch(`/api/products/suggest?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`Suggestions ${response.status}`);
        const data = await response.json() as { items: Suggestion[] };
        setItems(data.items);
        setStatus("ready");
      } catch {
        if (!controller.signal.aborted) {
          setItems([]);
          setStatus("error");
        }
      }
    }, 220);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [category, lang, term, visible]);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!formRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  return <form
    ref={formRef}
    action={`/${lang}/products`}
    role="search"
    className={`relative z-30 flex w-full items-center gap-2 p-2 ${hero ? "mx-auto max-w-2xl rounded-[24px] border border-white/35 bg-primary/55 text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl md:rounded-full" : "max-w-3xl rounded-2xl bg-[#f3f5f7] shadow-lg"}`}
  >
    {category && <input type="hidden" name="category" value={category} />}
    <label className="sr-only" htmlFor={inputId}>{t.searchProducts}</label>
    {hero && <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="ml-3 size-5 shrink-0 text-white/85 md:ml-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m16 16 5 5" /></svg>}
    <input
      id={inputId}
      name="q"
      type="search"
      enterKeyHint="search"
      maxLength={100}
      value={value}
      placeholder={t.searchProducts}
      role="combobox"
      aria-autocomplete="list"
      aria-expanded={visible}
      aria-controls={visible ? listId : undefined}
      aria-activedescendant={visible && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
      autoComplete="off"
      onFocus={() => {
        if (term) {
          setStatus("loading");
          setOpen(true);
        }
      }}
      onChange={(event) => {
        setValue(event.target.value);
        setItems([]);
        setActiveIndex(-1);
        setStatus("loading");
        setOpen(true);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          setActiveIndex(-1);
        } else if (event.key === "Enter" && visible && activeIndex >= 0 && items[activeIndex]) {
          event.preventDefault();
          router.push(`/${lang}/products/${items[activeIndex].slug}`);
          setOpen(false);
        } else if (event.key === "ArrowDown" && visible && items.length) {
          event.preventDefault();
          setActiveIndex((index) => (index + 1) % items.length);
        } else if (event.key === "ArrowUp" && visible && items.length) {
          event.preventDefault();
          setActiveIndex((index) => (index <= 0 ? items.length - 1 : index - 1));
        }
      }}
      className={`min-w-0 flex-1 rounded-xl bg-transparent py-3 outline-none focus-visible:ring-2 ${hero ? "px-1 text-white placeholder:text-white/75 focus-visible:ring-secondary" : "px-3 text-primary placeholder:text-primary/55 focus-visible:ring-primary"}`}
    />
    <button type="submit" className={`shrink-0 px-4 py-3 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 md:px-6 ${hero ? "rounded-2xl bg-secondary text-primary hover:bg-white focus-visible:outline-secondary md:rounded-full" : "rounded-xl bg-primary text-white hover:bg-primary/85 focus-visible:outline-primary"}`}>{t.search}</button>

    {visible && <div id={listId} role="listbox" aria-label={t.searchProducts} aria-busy={status === "loading"} className="absolute inset-x-0 top-full z-50 mt-2 max-h-[min(480px,60vh)] overflow-y-auto rounded-2xl bg-white p-2 text-primary shadow-[0_18px_50px_rgba(0,0,0,0.2)] ring-1 ring-primary/10">
      {status === "loading" ? <p className="px-4 py-3 text-sm text-textSecondary">{loadingLabel[lang]}</p>
        : status === "error" ? <p className="px-4 py-3 text-sm text-textSecondary">{t.unavailable}</p>
          : items.length ? <>
            {items.map((item, index) => <Link
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              href={`/${lang}/products/${item.slug}`}
              key={item.id}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-[#f3f5f7] ${index === activeIndex ? "bg-[#f3f5f7]" : ""}`}
            >
              <Image src={assetUrl(item.image)} alt="" width={56} height={56} sizes="56px" unoptimized={/^https?:\/\//i.test(assetUrl(item.image))} className="size-14 shrink-0 rounded-lg bg-[#f3f5f7] object-cover" />
              <span className="min-w-0"><span className="block truncate font-medium">{item.title}</span>{item.manufacturer && <span className="block truncate text-sm text-textSecondary">{item.manufacturer}</span>}</span>
            </Link>)}
            <Link href={`/${lang}/products?${new URLSearchParams({ q: term, ...(category ? { category } : {}) })}`} onClick={() => setOpen(false)} className="mt-1 block rounded-xl px-4 py-3 text-sm font-medium hover:bg-[#f3f5f7]">{t.viewAll} ↗</Link>
          </> : <p className="px-4 py-3 text-sm text-textSecondary">{t.noSearchResults}</p>}
    </div>}
  </form>;
}
