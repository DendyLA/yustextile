export type Locale = "tm" | "ru" | "en";

export type ListResult<T> = { items: T[]; total: number; page: number; limit: number; error?: boolean };
export type Category = { id: string; slug: string; title: string; image: string | null; parentId: string | null; productCount?: number; children?: Category[] };
export type Product = { id: string; slug: string; title: string; text: string; manufacturer: string | null; priceLabel: string | null; minimumOrder: string | null; images: string[]; recommended: boolean; categoryId: string; category?: Pick<Category, "id" | "slug" | "title">; specs: { id: string; name: string; value: string }[]; updatedAt?: string };
export type Promo = { id: string; title: string; text: string; images: string[] };
export type About = { title: string; text: string };
export type AboutBlock = { id: string; image: string | null; title: string; lead: string | null; text: string };
export type Partner = { id: string; logo: string; name: string | null; url: string | null };
export type Complex = { id: string; slug: string; image: string; title: string; text: string; foundedYear: number | null; updatedAt?: string };
export type Faq = { id: string; question: string; answer: string };
export type BlogPost = { id: string; slug: string; image: string; title: string; text: string; publishedAt: string; updatedAt?: string };
export type Contact = { email: string; phone: string; whatsapp: string; telegramPhone: string | null; address: string; logo: string | null };
export type Catalog = { id: string; title: string; pdfTk: string | null; pdfRu: string | null; pdfEn: string | null };
