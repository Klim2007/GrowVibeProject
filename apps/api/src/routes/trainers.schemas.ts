import { z } from "zod";

export const createTrainerSchema = z.object({
  title: z.string().min(1).max(200),
  language: z.string().min(2).max(10).default("ru"),
  passingScore: z.number().int().min(0).max(100).default(80),
  scormVersion: z.literal("1.2").default("1.2"),
});

export type CreateTrainerInput = z.infer<typeof createTrainerSchema>;

export const updateTrainerSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  language: z.string().min(2).max(10).optional(),
  passingScore: z.number().int().min(0).max(100).optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export type UpdateTrainerInput = z.infer<typeof updateTrainerSchema>;

export const reorderScreensSchema = z.array(
  z.object({
    id: z.string().min(1),
    order: z.number().int().min(0),
  }),
);

export type ReorderScreensInput = z.infer<typeof reorderScreensSchema>;
