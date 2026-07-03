import { z } from "zod";
import { ExpectedValueSchema } from "./validation-rules.js";

export const RegionSchema = z
  .object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    width: z.number().min(0).max(1),
    height: z.number().min(0).max(1),
  })
  .refine((region) => region.x + region.width <= 1, {
    message: "region x + width must not exceed 1",
    path: ["width"],
  })
  .refine((region) => region.y + region.height <= 1, {
    message: "region y + height must not exceed 1",
    path: ["height"],
  });

export type Region = z.infer<typeof RegionSchema>;

export const OnSuccessSchema = z.object({
  next_screen: z.string().min(1).nullable(),
  score: z.number().int().min(0).default(0),
});

export const OnErrorSchema = z.object({
  hint: z.string().default(""),
  retry: z.boolean().default(true),
});

const HotspotBaseSchema = z.object({
  hotspot_id: z.string().min(1),
  slug: z.string().min(1).optional(),
  region: RegionSchema,
  on_success: OnSuccessSchema,
  on_error: OnErrorSchema,
});

export const ClickHotspotSchema = HotspotBaseSchema.extend({
  type: z.literal("click"),
});

export const InputHotspotSchema = HotspotBaseSchema.extend({
  type: z.literal("input"),
  expected_value: ExpectedValueSchema,
});

export const HotspotSchema = z.discriminatedUnion("type", [
  ClickHotspotSchema,
  InputHotspotSchema,
]);

export type ClickHotspot = z.infer<typeof ClickHotspotSchema>;
export type InputHotspot = z.infer<typeof InputHotspotSchema>;
export type Hotspot = z.infer<typeof HotspotSchema>;
export type HotspotType = Hotspot["type"];
