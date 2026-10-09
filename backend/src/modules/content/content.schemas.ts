import { z } from 'zod';
import { localized } from '../../common/i18n/localization';

const url = z.string().trim().url();
const image = z.string().trim().min(1);
const slug = z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const base = { sortOrder: z.number().int().default(0), active: z.boolean().default(true) };

export const schemas = {
  promos: z.object({ title: localized, text: localized, images: z.array(image).min(1), ...base }).strict(),
  catalogs: z.object({ title: localized, pdfTk: image.nullable().optional(), pdfRu: image.nullable().optional(), pdfEn: image.nullable().optional(), active: z.boolean().default(true) }).strict(),
  categories: z.object({ slug, title: localized, image: image.nullable().optional(), parentId: z.string().uuid().nullable().optional(), ...base }).strict(),
  products: z.object({
    slug, categoryId: z.string().uuid(), title: localized, text: localized,
    manufacturer: localized.nullable().optional(), priceLabel: localized.nullable().optional(),
    minimumOrder: localized.nullable().optional(), images: z.array(image).min(1),
    recommended: z.boolean().default(false), ...base,
    specs: z.array(z.object({ name: localized, value: localized, sortOrder: z.number().int().default(0) }).strict()).default([]),
  }).strict(),
  'about-blocks': z.object({ image: image.nullable().optional(), title: localized, lead: localized.nullable().optional(), text: localized, ...base }).strict(),
  partners: z.object({ logo: image, name: localized.nullable().optional(), url: url.nullable().optional(), ...base }).strict(),
  complexes: z.object({ slug, image, title: localized, text: localized, foundedYear: z.number().int().min(1800).max(2200).nullable().optional(), ...base }).strict(),
  faqs: z.object({ question: localized, answer: localized, ...base }).strict(),
  blog: z.object({ slug, image, title: localized, text: localized, publishedAt: z.coerce.date().optional(), active: z.boolean().default(true) }).strict(),
};
