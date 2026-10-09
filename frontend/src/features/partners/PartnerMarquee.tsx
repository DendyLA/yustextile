import Image from "next/image";
import { assetUrl } from "@/src/features/content/assets";
import type { Partner } from "@/src/features/content/types";

type PartnerMarqueeProps = {
  partners: Partner[];
  label: string;
};

export function PartnerMarquee({ partners, label }: PartnerMarqueeProps) {
  if (!partners.length) return null;

  // Keep each half of the loop wider than the viewport, even with a small API list.
  const repeated = Array.from({ length: Math.ceil(8 / partners.length) }, () => partners).flat();
  const duration = `${Math.max(32, repeated.length * 4)}s`;

  return (
    <div className="partner-marquee" aria-label={label}>
      <div className="partner-marquee-track" style={{ animationDuration: duration }}>
        {[0, 1].map((copy) => (
          <div className="partner-marquee-group" key={copy} aria-hidden={copy === 1}>
            {repeated.map((partner, index) => (
              <div className="partner-marquee-card" key={`${partner.id}-${index}`}>
                <Image
                  src={assetUrl(partner.logo)}
                  alt={copy === 0 ? partner.name || label : ""}
                  width={160}
                  height={112}
                  sizes="(max-width: 640px) 128px, 160px"
                  className="h-full w-full object-contain"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
