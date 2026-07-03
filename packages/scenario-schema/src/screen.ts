import { z } from "zod";
import { HotspotSchema } from "./hotspot.js";

export const ScreenSchema = z.object({
  screen_id: z.string().min(1),
  slug: z.string().min(1).optional(),
  image: z.string().min(1),
  narration: z.string().optional(),
  hotspots: z.array(HotspotSchema),
});

export type Screen = z.infer<typeof ScreenSchema>;
