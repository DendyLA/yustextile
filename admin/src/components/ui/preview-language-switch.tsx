"use client";

import { usePreviewLanguage } from "@/components/layout/admin-shell";
import { languages } from "@/lib/format";
import type { Language } from "@/lib/types";

export function PreviewLanguageSwitch() {
  const { language, setLanguage } = usePreviewLanguage();

  return (
    <div className="content-language-switch">
      <div>
        <strong>Язык просмотра</strong>
        <span>Выберите язык, чтобы проверить текст ниже</span>
      </div>
      <div
        className="content-language-options"
        aria-label="Язык просмотра контента"
      >
        {(Object.keys(languages) as Language[]).map((code) => (
          <button
            key={code}
            type="button"
            className={language === code ? "active" : ""}
            aria-pressed={language === code}
            onClick={() => setLanguage(code)}
          >
            {languages[code]}
          </button>
        ))}
      </div>
    </div>
  );
}
