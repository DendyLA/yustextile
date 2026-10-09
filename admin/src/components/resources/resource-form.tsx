"use client";

import { Fragment, useRef, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { errorMessage, languages } from "@/lib/format";
import { slugify } from "@/lib/slug";
import type {
  ContentItem,
  Language,
  Localized,
  ResourceDefinition,
} from "@/lib/types";
import { usePreviewLanguage, useToast } from "@/components/layout/admin-shell";
import { Drawer } from "@/components/ui/drawer";
import { Field } from "./field-input";
import {
  buildPayload,
  initialValues,
  type Specification,
  type Values,
} from "./form-model";

export function ResourceForm({
  definition,
  item,
  categories = [],
  onClose,
  onSave,
  save,
}: {
  definition: Pick<ResourceDefinition, "singular" | "fields">;
  item?: ContentItem | null;
  categories?: ContentItem[];
  onClose: () => void;
  onSave: () => void;
  save: (payload: Values) => Promise<unknown>;
}) {
  const notify = useToast();
  const { language: previewLanguage } = usePreviewLanguage();
  const [values, setValues] = useState<Values>(() =>
    initialValues(definition.fields, item),
  );
  const [language, setLanguage] = useState<Language>(previewLanguage);
  const [busy, setBusy] = useState(false);
  const slugSource = useRef<Language | null>(null);
  const hasSlug = definition.fields.some((field) => field.key === "slug");

  function update(key: string, value: unknown) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateTranslation(key: string, code: Language, value: string) {
    if (
      key === "title" &&
      hasSlug &&
      !item &&
      !slugSource.current &&
      value.trim()
    ) {
      slugSource.current = code;
    }

    setValues((current) => {
      const translated = { ...(current[key] as Localized), [code]: value };
      const next = { ...current, [key]: translated };

      if (key === "title" && hasSlug && !item && slugSource.current) {
        next.slug = slugify(translated[slugSource.current]);
      }

      return next;
    });
  }

  function updateArray(key: string, index: number, value: string) {
    const copy = [...(values[key] as string[])];
    copy[index] = value;
    update(key, copy);
  }

  function updateSpec(index: number, part: "name" | "value", value: string) {
    const copy = [...(values.specs as Specification[])];
    copy[index] = {
      ...copy[index],
      [part]: { ...copy[index][part], [language]: value },
    };
    update("specs", copy);
  }

  async function upload(file: File, onDone: (url: string) => void) {
    try {
      const result = await api.upload(file);
      onDone(result.url);
      notify("Файл загружен");
    } catch (cause) {
      notify(errorMessage(cause), true);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      if (hasSlug && !item && !values.slug) {
        throw new Error(
          "Введите название с буквами или цифрами, чтобы создать адрес страницы.",
        );
      }
      const payload = buildPayload(definition.fields, values);
      const baseSlug = String(payload.slug || "");
      let savedSlug = baseSlug;

      for (let attempt = 1; attempt <= 20; attempt += 1) {
        savedSlug = attempt === 1 ? baseSlug : `${baseSlug}-${attempt}`;
        try {
          await save(attempt === 1 ? payload : { ...payload, slug: savedSlug });
          break;
        } catch (cause) {
          const duplicateSlug = errorMessage(cause).includes(
            "Slug or other unique field already exists",
          );
          if (item || !hasSlug || !duplicateSlug || attempt === 20) {
            throw cause;
          }
        }
      }

      notify(
        item
          ? "Изменения сохранены"
          : hasSlug
            ? `Запись добавлена · адрес: ${savedSlug}`
            : "Запись добавлена",
      );
      onSave();
      onClose();
    } catch (cause) {
      notify(errorMessage(cause), true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Drawer
      eyebrow={item ? "Редактирование" : "Новая запись"}
      title={`${item ? "Редактировать" : "Добавить"} ${definition.singular}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>
            Отмена
          </button>
          <button
            className="btn primary"
            type="submit"
            form="resource-form"
            disabled={busy}
          >
            {busy
              ? "Сохраняем…"
              : item
                ? "Сохранить изменения"
                : "Добавить запись"}
          </button>
        </>
      }
    >
      <form id="resource-form" onSubmit={submit}>
        <p className="form-language-label">Язык текста</p>
        <div className="langs" role="tablist" aria-label="Язык полей">
          {(Object.keys(languages) as Language[]).map((code) => (
            <button
              type="button"
              role="tab"
              aria-selected={language === code}
              className={language === code ? "active" : ""}
              onClick={() => setLanguage(code)}
              key={code}
            >
              {languages[code]}
            </button>
          ))}
        </div>
        <div className="form-grid">
          {definition.fields.map((field) =>
            field.key === "slug" ? null : (
              <Fragment key={field.key}>
                <Field
                  field={field}
                  value={values[field.key]}
                  language={language}
                  categories={categories.filter(
                    (category) => category.id !== item?.id,
                  )}
                  onChange={(value) => update(field.key, value)}
                  onTranslation={(value) =>
                    updateTranslation(field.key, language, value)
                  }
                  onArrayChange={(index, value) =>
                    updateArray(field.key, index, value)
                  }
                  onSpecChange={updateSpec}
                  onUpload={upload}
                />
                {field.key === "title" && hasSlug && (
                  <div className="generated-slug">
                    <strong>Адрес страницы создаётся автоматически</strong>
                    <code>
                      {String(values.slug || "Название ещё не введено")}
                    </code>
                    {item && (
                      <small>
                        У опубликованной записи адрес сохраняется при изменении
                        названия.
                      </small>
                    )}
                  </div>
                )}
              </Fragment>
            ),
          )}
        </div>
      </form>
    </Drawer>
  );
}
