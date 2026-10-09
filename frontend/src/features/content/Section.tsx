import Link from "next/link";
import { Locale } from "./types";
import { ui } from "../i18n/ui";

export function Section({ title, href, lang, children, id }: { title: string; href?: string; lang: Locale; children: React.ReactNode; id?: string }) {
  return <section id={id} className="container mx-auto scroll-mt-20 px-4 py-16 md:py-24">
    <div className="flex justify-between items-center gap-4 mb-10"><h2 className="text-3xl md:text-4xl">{title}</h2>{href && <Link href={href} className="rounded-full bg-secondary px-5 py-3 shrink-0 hover:bg-[#c6f19e]">{ui(lang).viewAll} ↗</Link>}</div>
    {children}
  </section>;
}
