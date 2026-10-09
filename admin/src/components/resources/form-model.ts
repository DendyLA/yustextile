import { languages } from "@/lib/format";
import type {
  ContentItem,
  FieldDefinition,
  Language,
  Localized,
} from "@/lib/types";

export type Values = Record<string, unknown>;
export type Specification = {
  name: Localized;
  value: Localized;
  sortOrder: number;
};
export const blankLocalized = (): Localized => ({ ru: "", tk: "", en: "" });

export function localDateValue(value: unknown): string {
  const text = String(value || "");
  if (!text) return "";
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(text)) return text;

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (number: number) => String(number).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function initialValues(
  fields: FieldDefinition[],
  item?: ContentItem | null,
): Values {
  return Object.fromEntries(
    fields.map((field) => {
      const existing = item?.[field.key];
      if (existing !== undefined && existing !== null)
        return [field.key, existing];
      if (field.type === "localized" || field.type === "localizedText") {
        return [field.key, blankLocalized()];
      }
      if (field.type === "images") return [field.key, [""]];
      if (field.type === "specs") return [field.key, []];
      if (field.type === "boolean") return [field.key, field.key === "active"];
      if (field.key === "sortOrder") return [field.key, 0];
      return [field.key, ""];
    }),
  );
}

export function buildPayload(
  fields: FieldDefinition[],
  values: Values,
): Values {
  const result: Values = {};

  for (const field of fields) {
    const value = values[field.key];

    if (field.type === "localized" || field.type === "localizedText") {
      const translations = value as Localized;
      const clean = {
        tk: translations.tk.trim(),
        ru: translations.ru.trim(),
        en: translations.en.trim(),
      };
      const hasText = Object.values(clean).some(Boolean);

      if (!hasText && !field.required) {
        result[field.key] = null;
      } else if (Object.values(clean).some((text) => !text)) {
        throw new Error(`Заполните «${field.label}» на всех трёх языках.`);
      } else {
        result[field.key] = clean;
      }
      continue;
    }

    if (field.type === "images") {
      const images = (value as string[])
        .map((image) => image.trim())
        .filter(Boolean);
      if (field.required && images.length === 0) {
        throw new Error("Загрузите хотя бы одно изображение.");
      }
      result[field.key] = images;
      continue;
    }

    if (field.type === "specs") {
      const specs = value as Specification[];
      for (const spec of specs) {
        for (const language of Object.keys(languages) as Language[]) {
          if (!spec.name[language].trim() || !spec.value[language].trim()) {
            throw new Error("Заполните характеристики на всех трёх языках.");
          }
        }
      }
      result[field.key] = specs.map((spec, index) => ({
        name: spec.name,
        value: spec.value,
        sortOrder: index,
      }));
      continue;
    }

    if (field.type === "boolean") {
      result[field.key] = Boolean(value);
    } else if (field.type === "number") {
      const number = String(value ?? "").trim();
      result[field.key] = number
        ? Number(number)
        : field.key === "sortOrder"
          ? 0
          : null;
    } else if (field.type === "date") {
      if (value) result[field.key] = new Date(String(value)).toISOString();
    } else {
      const text = String(value ?? "").trim();
      if (field.required && !text)
        throw new Error(`Заполните «${field.label}».`);
      result[field.key] =
        ["parent", "image", "file", "url"].includes(field.type) ||
        field.key === "telegramPhone"
          ? text || null
          : text;
    }
  }

  return result;
}
