"use client";

import { ReactNode, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  children: ReactNode;
  size?: "regular" | "wide";
  tone?: "light" | "dark";
};

const focusable = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({ open, onClose, title, closeLabel, children, size = "regular", tone = "light" }: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const elements = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(focusable));
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#001c1a]/70 backdrop-blur-md md:p-6"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`dialog-panel relative flex h-dvh w-full flex-col overflow-hidden shadow-2xl md:h-auto md:rounded-[32px] ${size === "wide" ? "md:max-w-6xl" : "md:max-w-4xl"} ${tone === "dark" ? "bg-[#061b19] text-white md:max-h-[95dvh]" : "bg-white text-primary md:max-h-[min(88dvh,900px)]"}`}
      >
        <div className={`flex shrink-0 items-center justify-between gap-5 border-b px-5 py-4 md:px-8 md:py-5 ${tone === "dark" ? "border-white/10" : "border-primary/10"}`}>
          <h2 id={titleId} className="min-w-0 truncate text-xl font-semibold md:text-2xl">{title}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className={`flex size-11 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${tone === "dark" ? "bg-white/15 hover:bg-white/25 focus-visible:outline-white" : "bg-[#f3f5f7] hover:bg-secondary focus-visible:outline-primary"}`}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-5">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:p-8">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
