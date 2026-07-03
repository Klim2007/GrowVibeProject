import { z } from "zod";
import { ScreenSchema } from "./screen.js";

export const SCENARIO_SCHEMA_VERSION = "1.0";

export const ScenarioSchema = z.object({
  schema_version: z.literal(SCENARIO_SCHEMA_VERSION).default(SCENARIO_SCHEMA_VERSION),
  trainer_id: z.string().min(1),
  title: z.string().min(1),
  language: z.string().min(2).default("ru"),
  scorm_version: z.literal("1.2"),
  passing_score: z.number().int().min(0).max(100),
  screens: z.array(ScreenSchema).min(1),
});

export type Scenario = z.infer<typeof ScenarioSchema>;
