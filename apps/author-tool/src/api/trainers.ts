import { apiDelete, apiGet, apiPatch, apiPost } from "./client.js";
import type { ScreenDto, TrainerDto, TrainerSummaryDto } from "./types.js";

export function listTrainers(): Promise<TrainerSummaryDto[]> {
  return apiGet("/api/trainers");
}

export function createTrainer(input: { title: string }): Promise<TrainerDto> {
  return apiPost("/api/trainers", input);
}

export function getTrainer(id: string): Promise<TrainerDto> {
  return apiGet(`/api/trainers/${id}`);
}

export function updateTrainer(
  id: string,
  input: Partial<{ title: string; passingScore: number; language: string; status: "draft" | "published" }>,
): Promise<TrainerDto> {
  return apiPatch(`/api/trainers/${id}`, input);
}

export function deleteTrainer(id: string): Promise<void> {
  return apiDelete(`/api/trainers/${id}`);
}

export function createScreen(
  trainerId: string,
  input: { imageUrl: string; order?: number; narration?: string; slug?: string },
): Promise<ScreenDto> {
  return apiPost(`/api/trainers/${trainerId}/screens`, input);
}

export function reorderScreens(trainerId: string, order: { id: string; order: number }[]): Promise<void> {
  return apiPost(`/api/trainers/${trainerId}/screens/reorder`, order);
}

export function uploadAsset(trainerId: string, file: File): Promise<{ url: string; width: number; height: number }> {
  const form = new FormData();
  form.append("image", file);
  return apiPost(`/api/trainers/${trainerId}/assets`, form);
}

export interface ExportResultDto {
  downloadUrl: string;
  sizeBytes: number;
  warnings: string[];
}

export function exportTrainerToScorm(trainerId: string): Promise<ExportResultDto> {
  return apiPost(`/api/trainers/${trainerId}/export`);
}
