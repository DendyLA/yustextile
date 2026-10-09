"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import blur from "@/public/images/heroSection/blur.png";
import madeInTurkmenistan from "@/public/icons/made-in-turkmenistan.svg";
import flag from "@/public/icons/flag.svg";
import { ChevronIcon } from "@/src/components/ChevronIcon";
import { assetUrl } from "../content/assets";
import { Locale, Promo } from "../content/types";
import { ui } from "../i18n/ui";
import { ProductSearch } from "../products/ProductSearch";

type Slide = { key: string; image: string; title: string; description: string };

export function PromoCarousel({ promos, lang }: { promos: Promo[]; lang: Locale }) {
  const slides: Slide[] = promos.flatMap((promo) =>
    promo.images.map((image, index) => ({
      key: `${promo.id}-${index}`,
      image,
      title: promo.title,
      description: promo.text,
    })),
  );
  const visibleSlides = slides.length
    ? slides
    : [{ key: "fallback", image: "/images/heroSection/slide-1.webp", title: "Yustextile", description: "" }];
  const [activeIndex, setActiveIndex] = useState(0);
  const count = visibleSlides.length;
  const next = useCallback(() => setActiveIndex((index) => (index + 1) % count), [count]);
  const previous = useCallback(() => setActiveIndex((index) => (index - 1 + count) % count), [count]);
  const handlers = useSwipeable({ onSwipedLeft: next, onSwipedRight: previous, preventScrollOnSwipe: true, trackMouse: true });
  const activeSlide = visibleSlides[activeIndex] || visibleSlides[0];
  const t = ui(lang);

  useEffect(() => {
    if (count < 2) return;
    const timer = window.setInterval(next, 4000);
    return () => window.clearInterval(timer);
  }, [count, next]);

  return (
    <section id="home" className="relative flex min-h-[calc(100svh-5rem)] flex-col justify-end overflow-hidden bg-primary px-4 text-white">
      <div className="absolute inset-x-0 top-5 z-20 px-4 md:top-8">
        <div className="container mx-auto"><ProductSearch lang={lang} hero /></div>
      </div>
      <div {...handlers} className="absolute inset-0 overflow-hidden">
        <div
          className="flex h-full w-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {visibleSlides.map((slide, index) => (
            <div key={slide.key} className="relative h-full w-full shrink-0">
              <Image
                src={assetUrl(slide.image)}
                alt={slide.title}
                fill
                priority={index === 0}
                loading={index === 0 ? undefined : "lazy"}
                sizes="100vw"
                unoptimized={/^https?:\/\//i.test(assetUrl(slide.image))}
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <Image src={blur} alt="" fill sizes="100vw" className="pointer-events-none object-cover" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-[40%] z-10 -translate-y-1/2 px-4 md:top-[30%]">
        <div className="container mx-auto">
          <div className="relative w-max">
            <Image
              src={madeInTurkmenistan}
              alt="Made in Turkmenistan"
              className="animate-spin rounded-full [animation-duration:20s] max-md:size-35"
            />
            <Image src={flag} alt="" className="absolute top-1/2 left-1/2 -translate-1/2 max-md:scale-75" />
          </div>
        </div>
      </div>

      <div className="container relative z-10 mx-auto flex flex-col gap-10 pb-12 pt-32">
        <div className="flex max-w-5xl flex-col gap-6 max-lg:items-center max-lg:text-center">
          <div className="flex flex-col gap-6">
            <h1 key={`${activeSlide.key}-title`} className="text-[40px] font-semibold leading-none md:text-[64px]">
              {activeSlide.title}
            </h1>
            {activeSlide.description && (
              <p key={`${activeSlide.key}-description`} className="max-w-3xl text-base leading-normal text-white/80 md:text-xl">
                {activeSlide.description}
              </p>
            )}
          </div>
        </div>
        {count > 1 && (
          <div className="flex justify-end gap-2 max-md:hidden">
            <button type="button" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-md transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" onClick={previous} aria-label={t.previous}>
              <ChevronIcon direction="left" />
            </button>
            <button type="button" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-md transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" onClick={next} aria-label={t.next}>
              <ChevronIcon direction="right" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
