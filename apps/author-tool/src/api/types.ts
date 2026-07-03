export type HotspotType = "click" | "input";

export type ExpectedValueDto =
  | { match: "exact"; value: string }
  | { match: "regex"; pattern: string }
  | { match: "nonEmpty" };

export interface RegionDto {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HotspotDto {
  id: string;
  screenId: string;
  type: HotspotType;
  order: number;
  slug?: string | null;
  region: RegionDto;
  expectedValue?: ExpectedValueDto;
  onSuccess: { nextScreenId: string | null; score: number };
  onError: { hint: string; retry: boolean };
}

export interface ScreenDto {
  id: string;
  trainerId: string;
  imageUrl: string;
  order: number;
  narration?: string | null;
  slug?: string | null;
  hotspots: HotspotDto[];
}

export interface TrainerSummaryDto {
  id: string;
  title: string;
  status: "draft" | "published";
  updatedAt: string;
}

export interface TrainerDto {
  id: string;
  title: string;
  language: string;
  passingScore: number;
  scormVersion: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
  screens: ScreenDto[];
}
