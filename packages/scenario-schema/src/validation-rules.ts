import { z } from "zod";

export const ExactMatchSchema = z.object({
  match: z.literal("exact"),
  value: z.string(),
});

export const RegexMatchSchema = z.object({
  match: z.literal("regex"),
  pattern: z.string().refine((pattern) => {
    try {
      new RegExp(pattern);
      return true;
    } catch {
      return false;
    }
  }, "pattern must be a valid regular expression"),
});

export const NonEmptyMatchSchema = z.object({
  match: z.literal("nonEmpty"),
});

export const ExpectedValueSchema = z.discriminatedUnion("match", [
  ExactMatchSchema,
  RegexMatchSchema,
  NonEmptyMatchSchema,
]);

export type ExpectedValue = z.infer<typeof ExpectedValueSchema>;
