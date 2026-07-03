import { z } from "zod";
import { ExpectedValueSchema, RegionSchema } from "scenario-schema";

const onSuccessSchema = z.object({
  nextScreenId: z.string().min(1).nullable().default(null),
  score: z.number().int().min(0).default(0),
});

const onErrorSchema = z.object({
  hint: z.string().max(500).default(""),
  retry: z.boolean().default(true),
});

const baseHotspotSchema = z.object({
  slug: z.string().min(1).max(100).optional(),
  order: z.number().int().min(0).optional(),
  region: RegionSchema,
  onSuccess: onSuccessSchema.default({}),
  onError: onErrorSchema.default({}),
});

export const createHotspotSchema = z.discriminatedUnion("type", [
  baseHotspotSchema.extend({ type: z.literal("click") }),
  baseHotspotSchema.extend({ type: z.literal("input"), expectedValue: ExpectedValueSchema }),
]);

export type CreateHotspotInput = z.infer<typeof createHotspotSchema>;

export const updateHotspotSchema = z.object({
  slug: z.string().min(1).max(100).optional(),
  order: z.number().int().min(0).optional(),
  region: RegionSchema.optional(),
  expectedValue: ExpectedValueSchema.optional(),
  onSuccess: onSuccessSchema.partial().optional(),
  onError: onErrorSchema.partial().optional(),
});

export type UpdateHotspotInput = z.infer<typeof updateHotspotSchema>;
