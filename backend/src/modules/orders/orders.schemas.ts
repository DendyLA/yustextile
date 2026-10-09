import { z } from 'zod';

export const orderSchema = z.object({
  name: z.string().trim().max(120).optional(), phone: z.string().trim().min(5).max(50),
  email: z.string().trim().email(), country: z.string().trim().min(2).max(100),
  address: z.string().trim().min(3).max(500), comment: z.string().trim().max(2000).optional(),
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().positive().max(100000) }).strict()).min(1),
}).strict();
export const statusSchema = z.object({ status: z.enum(['NEW', 'CONTACTED', 'CLOSED', 'CANCELLED']) }).strict();
