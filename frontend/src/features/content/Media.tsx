import { assetUrl } from "./assets";
import Image from "next/image";

type Props = { src?: string | null; alt: string; className?: string; sizes?: string; priority?: boolean; fit?: "cover" | "contain" | "natural" };

export function Media({ src, alt, className = "", sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw", priority = false, fit = "cover" }: Props) {
  const image = assetUrl(src);
  return <div className={`${fit === "natural" ? "flex justify-center" : `overflow-hidden ${fit === "contain" ? "bg-white" : "bg-[#edf1ed]"}`} ${className}`}>
    <Image src={image} alt={alt} width={1200} height={900} sizes={sizes} priority={priority} unoptimized={/^https?:\/\//i.test(image)} className={fit === "natural" ? "h-auto max-h-[640px] w-auto max-w-full rounded-3xl" : `h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"}`} />
  </div>;
}
