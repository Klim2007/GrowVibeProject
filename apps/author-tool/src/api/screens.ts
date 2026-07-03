import { apiDelete, apiPatch, apiPost } from "./client.js";
import type { HotspotDto, ScreenDto } from "./types.js";
import type { CreateHotspotInput } from "./hotspots.js";

export function updateScreen(
  id: string,
  input: Partial<{ order: number; narration: string; slug: string }>,
): Promise<ScreenDto> {
  return apiPatch(`/api/screens/${id}`, input);
}

export function deleteScreen(id: string): Promise<void> {
  return apiDelete(`/api/screens/${id}`);
}

export function createHotspot(screenId: string, input: CreateHotspotInput): Promise<HotspotDto> {
  return apiPost(`/api/screens/${screenId}/hotspots`, input);
}
