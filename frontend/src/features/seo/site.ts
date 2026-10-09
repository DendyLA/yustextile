import type { Metadata } from "next";
import { assetUrl } from "../content/assets";
import type { Locale } from "../content/types";

const configuredUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://www.yustextile.com";
export const siteUrl = configuredUrl.replace(/\/$/, "");
export const locales: Locale[] = ["tm", "ru", "en"];

export function pageUrl(lang: Locale, path = "") {
  return `${siteUrl}/${lang}${path}`;
}

export function imageUrl(path?: string | null) {
  const asset = assetUrl(path);
  return /^https?:\/\//i.test(asset) ? asset : `${siteUrl}${asset.startsWith("/") ? asset : `/${asset}`}`;
}

export function alternateLanguages(path = "") {
  return {
    tk: pageUrl("tm", path),
    ru: pageUrl("ru", path),
    en: pageUrl("en", path),
    "x-default": pageUrl("tm", path),
  };
}

export function excerpt(value: string | null | undefined, limit = 160) {
  const clean = (value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit - 1).replace(/\s+\S*$/, "")}…`;
}

type PageMetadataOptions = {
  lang: Locale;
  path: string;
  title: string;
  description: string;
  image?: string | null;
  noindex?: boolean;
  article?: { publishedTime?: string; modifiedTime?: string };
};

export function pageMetadata({ lang, path, title, description, image, noindex, article }: PageMetadataOptions): Metadata {
  const url = pageUrl(lang, path);
  const summary = excerpt(description);
  const previewImage = imageUrl(image || "/images/heroSection/slide-1.webp");
  const openGraph: Metadata["openGraph"] = article
    ? {
        type: "article", title, description: summary, url, siteName: "Yustextile",
        locale: lang === "tm" ? "tk_TM" : lang === "ru" ? "ru_RU" : "en_US",
        publishedTime: article.publishedTime,
        modifiedTime: article.modifiedTime,
        images: [{ url: previewImage, alt: title }],
      }
    : {
        type: "website", title, description: summary, url, siteName: "Yustextile",
        locale: lang === "tm" ? "tk_TM" : lang === "ru" ? "ru_RU" : "en_US",
        images: [{ url: previewImage, alt: title }],
      };

  return {
    title,
    description: summary,
    alternates: { canonical: url, languages: alternateLanguages(path) },
    openGraph,
    twitter: { card: "summary_large_image", title, description: summary, images: [previewImage] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
