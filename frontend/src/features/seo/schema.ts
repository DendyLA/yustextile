import type { Contact, Locale, Product, BlogPost } from "../content/types";
import { imageUrl, pageUrl, siteUrl } from "./site";

export function organizationSchema(contact: Contact | null) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "Yustextile",
    url: siteUrl,
    logo: imageUrl("/logos/yus-textile.png"),
    ...(contact?.email ? { email: contact.email } : {}),
    ...(contact?.phone ? { telephone: contact.phone } : {}),
  };
}

export function websiteSchema(lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: "Yustextile",
    url: pageUrl(lang),
    inLanguage: lang === "tm" ? "tk" : lang,
    publisher: { "@id": `${siteUrl}/#organization` },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem", position: index + 1, name: item.name, item: item.url,
    })),
  };
}

export function productSchema(product: Product, lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.text,
    url: pageUrl(lang, `/products/${product.slug}`),
    image: product.images.map(imageUrl),
    ...(product.manufacturer ? { manufacturer: { "@type": "Organization", name: product.manufacturer } } : {}),
    ...(product.category?.title ? { category: product.category.title } : {}),
    ...(product.specs.length ? { additionalProperty: product.specs.map((spec) => ({ "@type": "PropertyValue", name: spec.name, value: spec.value })) } : {}),
  };
}

export function blogPostSchema(post: BlogPost, lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.text,
    image: imageUrl(post.image),
    datePublished: post.publishedAt,
    ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
    inLanguage: lang === "tm" ? "tk" : lang,
    mainEntityOfPage: pageUrl(lang, `/blog/${post.slug}`),
    publisher: { "@id": `${siteUrl}/#organization` },
  };
}
