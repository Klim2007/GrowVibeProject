import { API_BASE, apiPost } from "./client.js";
import type { TrainerDto } from "./types.js";

export async function fetchScenarioJson(trainerId: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/trainers/${trainerId}/scenario.json`);
  if (!res.ok) throw new Error(`Failed to fetch scenario.json: ${res.status}`);
  return res.json();
}

export function importScenarioJson(trainerId: string, scenario: unknown): Promise<TrainerDto> {
  return apiPost(`/api/trainers/${trainerId}/scenario/import`, scenario);
}
