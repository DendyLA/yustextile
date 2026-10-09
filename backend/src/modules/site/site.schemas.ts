import { z } from 'zod';
import { localized } from '../../common/i18n/localization';

export const aboutSchema = z.object({ title: localized, text: localized }).strict();
export const contactSchema = z.object({
  email: z.string().trim().email(), phone: z.string().trim().min(3),
  whatsapp: z.string().trim().min(3),
  telegramPhone: z.string().trim().min(3).nullable().optional(),
  address: localized,
  logo: z.string().trim().min(1).nullable().optional(),
}).strict();
