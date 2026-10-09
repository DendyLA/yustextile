import type { Metadata } from "next";
import "./globals.css";
import "intl-tel-input/styles";
import { GoogleAnalytics } from "@next/third-parties/google";
import { notFound } from "next/navigation";
import { isLocale } from "@/src/features/i18n/ui";
import { seoCopy } from "@/src/features/seo/copy";
import { siteUrl } from "@/src/features/seo/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Yustextile", template: "%s | Yustextile" },
  description: seoCopy("en").homeDescription,
  applicationName: "Yustextile",
  openGraph: { type: "website", siteName: "Yustextile", images: ["/images/heroSection/slide-1.webp"] },
  twitter: { card: "summary_large_image", images: ["/images/heroSection/slide-1.webp"] },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={lang === "tm" ? "tk" : lang}>
      <body className="antialiased font-medium">{children}<GoogleAnalytics gaId="G-56ETXMTDBB" /></body>
    </html>
  );
}
