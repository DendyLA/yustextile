"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { Dialog } from "@/src/components/Dialog";
import { ChevronIcon } from "@/src/components/ChevronIcon";
import { assetUrl } from "../content/assets";
import { Locale } from "../content/types";
import { closeLabel, galleryLabels, ui } from "../i18n/ui";

type Props = { images: string[]; title: string; lang: Locale; allowLightbox?: boolean };

export function ProductGallery({ images, title, lang, allowLightbox = true }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const zoomAreaRef = useRef<HTMLDivElement>(null);
  const labels = galleryLabels(lang);
  const t = ui(lang);
  const count = images.length;
  const selectedIndex = Math.min(activeIndex, Math.max(count - 1, 0));
  const selectedImage = images[selectedIndex];

  const select = useCallback((index: number) => {
    setActiveIndex((index + count) % Math.max(count, 1));
    setZoomed(false);
  }, [count]);
  const previous = useCallback(() => select(selectedIndex - 1), [select, selectedIndex]);
  const next = useCallback(() => select(selectedIndex + 1), [select, selectedIndex]);
  const gallerySwipe = useSwipeable({ onSwipedLeft: next, onSwipedRight: previous, preventScrollOnSwipe: true, trackMouse: false });
  const lightboxSwipe = useSwipeable({ onSwipedLeft: zoomed ? undefined : next, onSwipedRight: zoomed ? undefined : previous, preventScrollOnSwipe: true, trackMouse: false });
  const { ref: lightboxSwipeRef, ...lightboxSwipeHandlers } = lightboxSwipe;

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") { event.preventDefault(); previous(); }
      if (event.key === "ArrowRight") { event.preventDefault(); next(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, next, previous]);

  useEffect(() => {
    if (!zoomed || !zoomAreaRef.current) return;
    const area = zoomAreaRef.current;
    area.scrollLeft = (area.scrollWidth - area.clientWidth) / 2;
    area.scrollTop = (area.scrollHeight - area.clientHeight) / 2;
  }, [zoomed]);

  if (!count) return <div className="flex aspect-square items-center justify-center rounded-3xl bg-[#f3f5f7] text-textSecondary">{labels.noPhotos}</div>;

  const imageSource = assetUrl(selectedImage);
  const unoptimized = /^https?:\/\//i.test(imageSource);
  const thumbnails = (dark: boolean) => count > 1 && <div role="group" aria-label={labels.photos} className="no-scrollbar flex gap-3 overflow-x-auto py-1">
    {images.map((image, index) => <button
      key={`${image}-${index}`}
      type="button"
      onClick={() => select(index)}
      aria-label={`${labels.photos}: ${index + 1} / ${count}`}
      aria-pressed={index === selectedIndex}
      className={`relative size-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${index === selectedIndex ? dark ? "border-secondary" : "border-primary" : dark ? "border-white/20 hover:border-white/70" : "border-primary/10 hover:border-primary/50"}`}
    >
      <Image src={assetUrl(image)} alt="" fill sizes="80px" unoptimized={/^https?:\/\//i.test(assetUrl(image))} className="object-contain" />
    </button>)}
  </div>;

  return <section aria-label={labels.photos} className="min-w-0">
    <div {...gallerySwipe} className="relative aspect-square overflow-hidden rounded-3xl bg-white ring-1 ring-primary/10 xl:aspect-auto xl:h-[min(50vh,540px)] xl:min-h-[320px]">
      {allowLightbox ? <button type="button" onClick={() => setLightboxOpen(true)} aria-label={labels.open} className="absolute inset-0 cursor-zoom-in focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-primary">
        <Image src={imageSource} alt={`${title} — ${selectedIndex + 1} / ${count}`} fill sizes="(max-width: 768px) 100vw, 50vw" priority unoptimized={unoptimized} className="object-contain" />
      </button> : <Image src={imageSource} alt={`${title} — ${selectedIndex + 1} / ${count}`} fill sizes="(max-width: 768px) 100vw, 50vw" unoptimized={unoptimized} className="object-contain" />}
      {count > 1 && <>
        <button type="button" onClick={previous} aria-label={t.previous} className="absolute left-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary shadow-md hover:bg-white focus-visible:outline-2 focus-visible:outline-primary"><ChevronIcon direction="left" /></button>
        <button type="button" onClick={next} aria-label={t.next} className="absolute right-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary shadow-md hover:bg-white focus-visible:outline-2 focus-visible:outline-primary"><ChevronIcon direction="right" /></button>
        <span aria-live="polite" className="absolute bottom-4 left-4 rounded-full bg-primary/75 px-3 py-1 text-sm text-white backdrop-blur-sm">{selectedIndex + 1} / {count}</span>
      </>}
      {allowLightbox && <span aria-hidden="true" className="pointer-events-none absolute bottom-4 right-4 flex size-11 items-center justify-center rounded-full bg-white/90 text-primary shadow-md"><svg viewBox="0 0 24 24" fill="none" className="size-5"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>}
    </div>
    {count > 1 && <div className="mt-4">{thumbnails(false)}</div>}

    {allowLightbox && <Dialog open={lightboxOpen} onClose={() => { setLightboxOpen(false); setZoomed(false); }} title={title} closeLabel={closeLabel(lang)} size="wide" tone="dark">
      <div className="flex flex-col gap-5">
        <div {...lightboxSwipeHandlers} ref={(node) => { zoomAreaRef.current = node; lightboxSwipeRef(node); }} className="relative h-[min(48dvh,620px)] w-full overflow-auto rounded-2xl bg-black/30">
          <button type="button" onClick={() => setZoomed((value) => !value)} aria-label={zoomed ? labels.zoomOut : labels.zoomIn} className={`relative block ${zoomed ? "h-[200%] w-[200%] cursor-zoom-out" : "h-full w-full cursor-zoom-in"}`}>
            <Image src={imageSource} alt={`${title} — ${selectedIndex + 1} / ${count}`} fill sizes={zoomed ? "200vw" : "(max-width: 768px) 100vw, 80vw"} unoptimized={unoptimized} className="object-contain" />
          </button>
          {!zoomed && count > 1 && <>
            <button type="button" onClick={previous} aria-label={t.previous} className="absolute left-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm hover:bg-white/25"><ChevronIcon direction="left" /></button>
            <button type="button" onClick={next} aria-label={t.next} className="absolute right-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm hover:bg-white/25"><ChevronIcon direction="right" /></button>
          </>}
        </div>
        <div className="flex items-center justify-between gap-4">
          <span aria-live="polite" className="text-sm text-white/75">{selectedIndex + 1} / {count}</span>
          <button type="button" onClick={() => setZoomed((value) => !value)} className="rounded-full border border-white/30 px-4 py-2 text-sm hover:bg-white/10">{zoomed ? labels.zoomOut : labels.zoomIn}</button>
        </div>
        {thumbnails(true)}
      </div>
    </Dialog>}
  </section>;
}
