"use client";

import { useState } from "react";
import { languages, localized } from "@/lib/format";
import type {
  ContentItem,
  FieldDefinition,
  Language,
  Localized,
} from "@/lib/types";
import {
  blankLocalized,
  localDateValue,
  type Specification,
} from "./form-model";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LongTextEditor } from "./long-text-editor";
export function Field({
  field,
  value,
  language,
  categories,
  onChange,
  onTranslation,
  onArrayChange,
  onSpecChange,
  onUpload,
}: {
  field: FieldDefinition;
  value: unknown;
  language: Language;
  categories: ContentItem[];
  onChange: (value: unknown) => void;
  onTranslation: (value: string) => void;
  onArrayChange: (index: number, value: string) => void;
  onSpecChange: (index: number, part: "name" | "value", value: string) => void;
  onUpload: (file: File, done: (url: string) => void) => Promise<void>;
}) {
  const label = `${field.label}${field.required ? " *" : ""}`;
  const [pendingRemoval, setPendingRemoval] = useState<number | null>(null);

  if (field.type === "boolean") {
    return (
      <label className="toggle-row full">
        {label}
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
        />
      </label>
    );
  }

  if (field.type === "localized" || field.type === "localizedText") {
    const translation = (value as Localized)?.[language] || "";
    return (
      <div className="field full">
        <label htmlFor={`${field.key}-${language}`}>
          {label} · {languages[language]}
        </label>
        {field.type === "localizedText" ? (
          <LongTextEditor
            id={`${field.key}-${language}`}
            label={field.label}
            language={language}
            value={translation}
            onChange={onTranslation}
          />
        ) : (
          <input
            id={`${field.key}-${language}`}
            value={translation}
            onChange={(event) => onTranslation(event.target.value)}
            placeholder={`${field.label} — ${languages[language]}`}
          />
        )}
        <small>Заполните на всех трёх языках.</small>
      </div>
    );
  }

  if (field.type === "category" || field.type === "parent") {
    return (
      <div className="field">
        <label htmlFor={field.key}>{label}</label>
        <select
          id={field.key}
          value={String(value || "")}
          onChange={(event) => onChange(event.target.value)}
          required={field.required}
        >
          <option value="">
            {field.type === "parent"
              ? "Нет — главная категория"
              : "Выберите категорию"}
          </option>
          {categories.map((category) => (
            <option value={category.id} key={category.id}>
              {localized(category.title, language) || "Без перевода"}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "image" || field.type === "file") {
    return (
      <div className="field full">
        <label htmlFor={field.key}>{label}</label>
        <div className="upload-row">
          <input
            id={field.key}
            value={String(value || "")}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Выберите файл или вставьте ссылку"
            required={field.required}
          />
          <label className="file-label">
            Загрузить
            <input
              type="file"
              accept={
                field.type === "file"
                  ? ".pdf,application/pdf"
                  : "image/png,image/jpeg,image/webp"
              }
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void onUpload(file, (url) => onChange(url));
              }}
            />
          </label>
        </div>
        {field.type === "image" && Boolean(value) && (
          // Uploaded media may be served by the backend or an external source.
          // eslint-disable-next-line @next/next/no-img-element
          <img className="file-preview" src={String(value)} alt="Превью" />
        )}
      </div>
    );
  }

  if (field.type === "images") {
    const images = value as string[];
    return (
      <div className="field full">
        <label>{label}</label>
        {images.map((image, index) => (
          <div className="array-item" key={index}>
            <div className="upload-row">
              <input
                value={image}
                onChange={(event) => onArrayChange(index, event.target.value)}
                placeholder="Ссылка на изображение"
              />
              <label className="file-label">
                Загрузить
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file)
                      void onUpload(file, (url) => onArrayChange(index, url));
                  }}
                />
              </label>
              <button
                type="button"
                className="icon-btn"
                aria-label="Убрать изображение"
                onClick={() => setPendingRemoval(index)}
              >
                ×
              </button>
            </div>
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="file-preview" src={image} alt="Превью" />
            )}
          </div>
        ))}
        <button
          type="button"
          className="btn soft sm"
          onClick={() => onChange([...images, ""])}
        >
          ＋ Добавить изображение
        </button>
        {pendingRemoval !== null && (
          <ConfirmDialog
            title="Убрать изображение?"
            description="Изображение исчезнет из этой записи после сохранения изменений."
            confirmLabel="Да, убрать"
            destructive
            onCancel={() => setPendingRemoval(null)}
            onConfirm={() => {
              onChange(images.filter((_, index) => index !== pendingRemoval));
              setPendingRemoval(null);
            }}
          />
        )}
      </div>
    );
  }

  if (field.type === "specs") {
    const specs = value as Specification[];
    return (
      <div className="field full">
        <label>{label}</label>
        {specs.map((spec, index) => (
          <div className="array-item" key={index}>
            <div className="array-item-head">
              Характеристика {index + 1} · {languages[language]}
              <button
                type="button"
                className="icon-btn"
                aria-label="Убрать характеристику"
                onClick={() => setPendingRemoval(index)}
              >
                ×
              </button>
            </div>
            <div className="form-grid">
              <div className="field">
                <label>Название</label>
                <input
                  value={spec.name[language]}
                  onChange={(event) =>
                    onSpecChange(index, "name", event.target.value)
                  }
                />
              </div>
              <div className="field">
                <label>Значение</label>
                <input
                  value={spec.value[language]}
                  onChange={(event) =>
                    onSpecChange(index, "value", event.target.value)
                  }
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="btn soft sm"
          onClick={() =>
            onChange([
              ...specs,
              {
                name: blankLocalized(),
                value: blankLocalized(),
                sortOrder: specs.length,
              },
            ])
          }
        >
          ＋ Добавить характеристику
        </button>
        {pendingRemoval !== null && (
          <ConfirmDialog
            title="Убрать характеристику?"
            description="Характеристика исчезнет из товара после сохранения изменений."
            confirmLabel="Да, убрать"
            destructive
            onCancel={() => setPendingRemoval(null)}
            onConfirm={() => {
              onChange(specs.filter((_, index) => index !== pendingRemoval));
              setPendingRemoval(null);
            }}
          />
        )}
      </div>
    );
  }

  const dateValue =
    field.type === "date" ? localDateValue(value) : String(value ?? "");

  return (
    <div className="field">
      <label htmlFor={field.key}>{label}</label>
      <input
        id={field.key}
        type={
          field.type === "date"
            ? "datetime-local"
            : field.type === "number"
              ? "number"
              : field.type === "url"
                ? "url"
                : field.key === "email"
                  ? "email"
                  : "text"
        }
        value={dateValue}
        onChange={(event) => onChange(event.target.value)}
        required={field.required}
        step={field.type === "number" ? 1 : undefined}
      />
    </div>
  );
}
