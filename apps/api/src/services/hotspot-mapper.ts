import type { Prisma } from "@prisma/client";
import type { ExpectedValue } from "scenario-schema";
import type { CreateHotspotInput, UpdateHotspotInput } from "../routes/hotspots.schemas.js";
import { sanitizeOptionalText } from "./sanitize.js";

export function toMatchFields(expectedValue: ExpectedValue | undefined) {
  if (!expectedValue) return { matchType: null, matchValue: null };
  switch (expectedValue.match) {
    case "exact":
      return { matchType: "exact" as const, matchValue: expectedValue.value };
    case "regex":
      return { matchType: "regex" as const, matchValue: expectedValue.pattern };
    case "nonEmpty":
      return { matchType: "nonEmpty" as const, matchValue: null };
  }
}

export function toHotspotCreateData(
  screenId: string,
  dto: CreateHotspotInput,
  order: number,
): Prisma.HotspotUncheckedCreateInput {
  const matchFields = dto.type === "input" ? toMatchFields(dto.expectedValue) : { matchType: null, matchValue: null };
  return {
    screenId,
    type: dto.type,
    order: dto.order ?? order,
    slug: dto.slug,
    regionX: dto.region.x,
    regionY: dto.region.y,
    regionWidth: dto.region.width,
    regionHeight: dto.region.height,
    ...matchFields,
    nextScreenId: dto.onSuccess.nextScreenId,
    successScore: dto.onSuccess.score,
    errorHint: sanitizeOptionalText(dto.onError.hint) ?? "",
    errorRetry: dto.onError.retry,
  };
}

export function toHotspotUpdateData(dto: UpdateHotspotInput): Prisma.HotspotUncheckedUpdateInput {
  const data: Prisma.HotspotUncheckedUpdateInput = {};
  if (dto.slug !== undefined) data.slug = dto.slug;
  if (dto.order !== undefined) data.order = dto.order;
  if (dto.region) {
    data.regionX = dto.region.x;
    data.regionY = dto.region.y;
    data.regionWidth = dto.region.width;
    data.regionHeight = dto.region.height;
  }
  if (dto.expectedValue !== undefined) {
    Object.assign(data, toMatchFields(dto.expectedValue));
  }
  if (dto.onSuccess) {
    if (dto.onSuccess.nextScreenId !== undefined) data.nextScreenId = dto.onSuccess.nextScreenId;
    if (dto.onSuccess.score !== undefined) data.successScore = dto.onSuccess.score;
  }
  if (dto.onError) {
    if (dto.onError.hint !== undefined) data.errorHint = sanitizeOptionalText(dto.onError.hint);
    if (dto.onError.retry !== undefined) data.errorRetry = dto.onError.retry;
  }
  return data;
}
