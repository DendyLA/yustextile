import type { Language, Localized } from "./types";

export const languages: Record<Language, string> = {
  ru: "Русский",
  tk: "Türkmen",
  en: "English",
};

export const statusLabels = {
  NEW: "Новая",
  CONTACTED: "Связались",
  CLOSED: "Закрыта",
  CANCELLED: "Отменена",
};

export function localized(value: unknown, language: Language = "ru"): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  const text = value as Partial<Localized>;
  return text[language] || "";
}

export function formatDate(value?: string): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Произошла неизвестная ошибка";
}
