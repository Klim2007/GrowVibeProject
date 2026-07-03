import { apiDelete, apiPatch } from "./client.js";
import type { ExpectedValueDto, HotspotDto, HotspotType, RegionDto } from "./types.js";

export interface CreateHotspotInput {
  type: HotspotType;
  slug?: string;
  region: RegionDto;
  expectedValue?: ExpectedValueDto;
  onSuccess?: { nextScreenId?: string | null; score?: number };
  onError?: { hint?: string; retry?: boolean };
}

export interface UpdateHotspotInput {
  slug?: string;
  region?: RegionDto;
  expectedValue?: ExpectedValueDto;
  onSuccess?: { nextScreenId?: string | null; score?: number };
  onError?: { hint?: string; retry?: boolean };
}

export function updateHotspot(id: string, input: UpdateHotspotInput): Promise<HotspotDto> {
  return apiPatch(`/api/hotspots/${id}`, input);
}

export function deleteHotspot(id: string): Promise<void> {
  return apiDelete(`/api/hotspots/${id}`);
}
