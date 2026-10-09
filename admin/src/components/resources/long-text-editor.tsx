"use client";

import { useRef, useState } from "react";
import type { Language } from "@/lib/types";

export function LongTextEditor({
  id,
  label,
  language,
  value,
  onChange,
}: {
  id: string;
  label: string;
  language: Language;
  value: string;
  onChange: (value: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  function insertText(text: string) {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    onChange(value.slice(0, start) + text + value.slice(end));

    window.requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(start + text.length, start + text.length);
    });
  }

  function insertList() {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const selected = value.slice(start, end);

    if (selected) {
      insertText(
        selected
          .split("\n")
          .map((line) => (line.startsWith("• ") ? line : `• ${line}`))
          .join("\n"),
      );
      return;
    }

    insertText(`${start > 0 && value[start - 1] !== "\n" ? "\n" : ""}• `);
  }

  return (
    <div className="long-text-editor">
      <div className="long-text-toolbar" aria-label="Инструменты для текста">
        <button
          type="button"
          onClick={() => insertText("\n\n")}
          title="Вставить пустую строку между абзацами"
        >
          ¶ <span>Абзац</span>
        </button>
        <button
          type="button"
          onClick={() => insertText("\n")}
          title="Перенести текст на новую строку"
        >
          ↵ <span>Новая строка</span>
        </button>
        <button
          type="button"
          onClick={insertList}
          title="Добавить список или оформить выделенные строки списком"
        >
          • <span>Список</span>
        </button>
        <button
          type="button"
          className={showPreview ? "active" : ""}
          aria-pressed={showPreview}
          onClick={() => setShowPreview((current) => !current)}
        >
          ◉ <span>Предпросмотр</span>
        </button>
      </div>
      <textarea
        ref={textareaRef}
        id={id}
        lang={language}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`Напишите ${label.toLowerCase()}. Enter — новая строка, Enter дважды — новый абзац.`}
        spellCheck
      />
      <div className="long-text-meta">
        <span>Enter — строка · Enter дважды — абзац</span>
        <span>
          {words} слов · {value.length} символов
        </span>
      </div>
      {showPreview && (
        <div className="long-text-preview">
          <strong>Как будет выглядеть на сайте</strong>
          <div>{value || "Здесь появится текст после ввода."}</div>
        </div>
      )}
    </div>
  );
}
