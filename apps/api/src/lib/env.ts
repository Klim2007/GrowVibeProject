import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(4000),
  UPLOAD_DIR: z.string().min(1).default("./uploads"),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(10),
  PLAYER_BUNDLE_DIR: z.string().min(1).default("../player/dist"),
  IMAGE_MAX_DIMENSION: z.coerce.number().positive().default(1920),
  IMAGE_QUALITY: z.coerce.number().int().min(1).max(100).default(80),
  MAX_PACKAGE_SIZE_MB: z.coerce.number().positive().default(150),
});

export const env = envSchema.parse(process.env);
