import Link from "next/link";
import { Media } from "../content/Media";
import { Complex, Locale } from "../content/types";
import { ui } from "../i18n/ui";

export function ComplexCard({ complex, lang }: { complex: Complex; lang: Locale }) {
  const t = ui(lang);

  return <article className="group">
    <Link href={`/${lang}/production/${complex.slug}`} className="relative block w-full text-left">
      <Media src={complex.image} alt={complex.title} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" fit="contain" className="aspect-square rounded-2xl ring-1 ring-primary/10" />
      <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-2 text-sm text-primary backdrop-blur-sm">{t.details} ↗</span>
    </Link>
    <h3 className="mt-4 text-xl group-hover:underline"><Link href={`/${lang}/production/${complex.slug}`}>{complex.title} ↗</Link></h3>
    {complex.foundedYear && <p className="mt-2 text-textSecondary">{t.founded}: {complex.foundedYear}</p>}
  </article>;
}
