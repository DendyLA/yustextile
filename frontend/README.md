# Yustextile frontend

Next.js App Router, React and TypeScript. The public site has three languages (`tm`, `ru`, `en`) and reads its content from the NestJS API. It does not contain a copy of the catalog data.

## Run locally

Create `.env.local` from `.env.example`, then run:

```powershell
pnpm install
pnpm dev
```

The API is expected at `http://localhost:4000` by default. `API_BASE_URL` is used for server-side reads, order/newsletter requests and the same-origin `/uploads/*` proxy for images and PDFs. Set it to the deployed API origin in production. `SITE_URL` must be the public website origin for canonical links and the sitemap. `NEXT_PUBLIC_API_BASE_URL` is only a fallback for nonstandard relative asset paths. Do not put admin credentials in frontend environment variables.

## Structure

| Path | Responsibility |
| --- | --- |
| `src/app/[lang]/(pages)` | Public routes and server-side page composition |
| `src/app/api` | Same-origin proxy for order and newsletter POSTs |
| `src/features/content` | Typed API client, content models, asset URLs and shared content UI |
| `src/features/products` | Product card |
| `src/features/cart` | Persistent cart and order form |
| `src/features/production` | Production complex card and quick view |
| `src/features/i18n` | UI labels (content translations come from the API) |
| `src/components` | Shared header, footer and accessible dialog shell |
| `public` | Brand assets and old local imagery used only as visual fallback |

The API client in `src/features/content/api.ts` sends `?lang=tk` for the Turkmen route and caches successful GET responses for 60 seconds. The catalog uses paginated `/api/products` calls and category filtering. Search on the promo and catalog pages filters the complete active product list on the server, then paginates matches; search URLs are `noindex`. If the catalog becomes very large, add a search filter to the backend API instead of scanning all products. The home page requests `/api/products?recommended=true`; an active product appears there only after its `recommended` field is enabled. The blog, FAQ, production facilities, partners, promotions, about text, contacts and PDFs also come from the API.

Images under `/uploads/*` use the Next.js image optimizer with responsive sizes, lazy loading below the fold, AVIF/WebP negotiation and a seven-day transform cache. The first promo image is preloaded. External image URLs remain unoptimized because their hosts are not configured in Next.js.

Cart items are stored in the browser under `yustextile-cart`. Checkout sends product IDs and quantities to `/api/orders`; the API validates products and stores the order. No price calculation or payment is implemented because the API provides price labels, not numeric prices.

Product and production cards open a quick-view dialog and still link to a full detail page. Product photos use a shared gallery with visible thumbnails and swipe navigation; the detail page also opens a dark full-view dialog with tap/click zoom and keyboard arrow navigation. The cart opens from the header as a dialog and also remains available at `/[lang]/cart`. Dialogs are centered on desktop, fill the viewport on mobile, close with Escape or backdrop click, and keep keyboard focus inside while open.

## Checks

```powershell
pnpm lint
pnpm build
```

The current API seed has 42 products but no recommended products or blog posts. Those sections will show an empty state until content is published in the API.

## SEO

Set `SITE_URL=https://www.yustextile.com` for production. Page metadata uses this origin for canonical URLs, language alternates, Open Graph and Twitter cards. `/sitemap.xml` includes the active product, category, production and blog URLs in all three languages and refreshes from the API. `/robots.txt` points to that sitemap. The cart is marked `noindex`, and an empty blog is kept out of the sitemap until posts are published.

Product and article pages render JSON-LD based on API fields. Product markup intentionally omits numeric prices and availability because the API does not provide them. The frontend serves uploaded images and PDFs at `/uploads/*` through a same-origin rewrite to `API_BASE_URL`, so public image URLs in metadata and sitemap use the website domain. After deployment, submit `https://<your-domain>/sitemap.xml` in Google Search Console and check indexing there; search ranking and rich-result appearance are determined by search engines.
