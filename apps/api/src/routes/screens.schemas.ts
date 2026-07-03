import { z } from "zod";

export const createScreenSchema = z.object({
  imageUrl: z.string().min(1),
  order: z.number().int().min(0).optional(),
  narration: z.string().max(2000).optional(),
  slug: z.string().min(1).max(100).optional(),
});

export type CreateScreenInput = z.infer<typeof createScreenSchema>;

export const updateScreenSchema = z.object({
  order: z.number().int().min(0).optional(),
  narration: z.string().max(2000).optional(),
  slug: z.string().min(1).max(100).optional(),
});

export type UpdateScreenInput = z.infer<typeof updateScreenSchema>;
