import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

export const localized = z.object({
  tk: z.string().trim().min(1),
  ru: z.string().trim().min(1),
  en: z.string().trim().min(1),
}).strict();

export function localizedResponse(value: unknown, lang?: string): unknown {
  if (!lang) return value;
  if (Array.isArray(value)) return value.map((item) => localizedResponse(item, lang));
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const object = value as Record<string, unknown>;
    if (['tk', 'ru', 'en'].every((key) => typeof object[key] === 'string') && Object.keys(object).length === 3) return object[lang];
    return Object.fromEntries(Object.entries(object).map(([key, item]) => [key, localizedResponse(item, lang)]));
  }
  return value;
}

export function validLang(lang?: string): string | undefined {
  if (!lang) return undefined;
  if (!['tk', 'ru', 'en'].includes(lang)) throw new BadRequestException('lang must be tk, ru or en');
  return lang;
}
