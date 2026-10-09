import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "ru", "tm"];
const defaultLocale = "tm";

function getPreferredLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // Parse Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const preferredLang = acceptLanguage.split(",")[0].split("-")[0];
    if (locales.includes(preferredLang)) {
      return preferredLang;
    }
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return;
  }

  // If pathname already includes locale, do nothing
  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (pathnameHasLocale) {
    return;
  }

  const locale = getPreferredLocale(request);

  // Rewrite to locale-prefixed path
  const redirectUrl = new URL(`/${locale}${pathname}`, request.url);
  const response = NextResponse.redirect(redirectUrl);

  return response;
}
