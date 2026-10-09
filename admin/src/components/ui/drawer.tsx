"use client";

import { useEffect, type ReactNode } from "react";

export function Drawer({
  eyebrow,
  title,
  children,
  footer,
  onClose,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  footer: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [onClose]);

  return (
    <div
      className="drawer-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="drawer-head">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        <div className="drawer-body">{children}</div>
        <div className="drawer-footer">{footer}</div>
      </section>
    </div>
  );
}
