import Image from "next/image";
import logo from "@/public/logos/yus-textile.png";

export function BrandLogo({ compactOnMobile = false }: { compactOnMobile?: boolean }) {
  return <span className={`relative block shrink-0 overflow-hidden ${compactOnMobile ? "h-[75px] w-[120px] md:h-[110px] md:w-[180px]" : "h-[110px] w-[180px]"}`}>
    <Image
      src={logo}
      alt="Yus Textile Turkmenistan"
      priority={compactOnMobile}
      className={`absolute h-auto max-w-none brightness-[1.8] ${compactOnMobile ? "-left-[20px] -top-[23px] w-[160px] md:-left-[30px] md:-top-[34px] md:w-[240px]" : "-left-[30px] -top-[34px] w-[240px]"}`}
    />
  </span>;
}
