import type { Hotspot as PrismaHotspot, Screen as PrismaScreen, Trainer as PrismaTrainer } from "@prisma/client";

type ScreenWithHotspots = PrismaScreen & { hotspots: PrismaHotspot[] };
type TrainerWithScreens = PrismaTrainer & { screens: ScreenWithHotspots[] };

export function serializeHotspot(hotspot: PrismaHotspot) {
  const expectedValue =
    hotspot.type === "input"
      ? hotspot.matchType === "exact"
        ? { match: "exact" as const, value: hotspot.matchValue ?? "" }
        : hotspot.matchType === "regex"
          ? { match: "regex" as const, pattern: hotspot.matchValue ?? "" }
          : { match: "nonEmpty" as const }
      : undefined;

  return {
    id: hotspot.id,
    screenId: hotspot.screenId,
    type: hotspot.type,
    order: hotspot.order,
    slug: hotspot.slug,
    region: {
      x: hotspot.regionX,
      y: hotspot.regionY,
      width: hotspot.regionWidth,
      height: hotspot.regionHeight,
    },
    expectedValue,
    onSuccess: {
      nextScreenId: hotspot.nextScreenId,
      score: hotspot.successScore,
    },
    onError: {
      hint: hotspot.errorHint ?? "",
      retry: hotspot.errorRetry,
    },
  };
}

export function serializeScreen(screen: ScreenWithHotspots) {
  return {
    id: screen.id,
    trainerId: screen.trainerId,
    imageUrl: screen.imageUrl,
    order: screen.order,
    narration: screen.narration,
    slug: screen.slug,
    hotspots: screen.hotspots.map(serializeHotspot),
  };
}

export function serializeTrainer(trainer: TrainerWithScreens) {
  return {
    id: trainer.id,
    title: trainer.title,
    language: trainer.language,
    passingScore: trainer.passingScore,
    scormVersion: trainer.scormVersion,
    status: trainer.status,
    createdAt: trainer.createdAt,
    updatedAt: trainer.updatedAt,
    screens: trainer.screens.map(serializeScreen),
  };
}
