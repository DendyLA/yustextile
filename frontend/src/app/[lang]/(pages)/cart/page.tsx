import { CartPage } from "@/src/features/cart/CartPage";
import { Locale } from "@/src/features/content/types";
import type { Metadata } from "next";
import { ui } from "@/src/features/i18n/ui";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: ui(lang).cart, robots: { index: false, follow: true } };
}
export default async function Cart({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  return <CartPage lang={lang} />;
}
