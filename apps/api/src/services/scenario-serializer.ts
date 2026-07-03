import type { Hotspot as PrismaHotspot, Screen as PrismaScreen, Trainer as PrismaTrainer } from "@prisma/client";
import { ScenarioSchema, type Scenario } from "scenario-schema";
import { prisma } from "../lib/prisma.js";
import { sanitizeText } from "./sanitize.js";
import { toMatchFields } from "./hotspot-mapper.js";

type ScreenWithHotspots = PrismaScreen & { hotspots: PrismaHotspot[] };
type TrainerWithScreens = PrismaTrainer & { screens: ScreenWithHotspots[] };

function serializeHotspotToScenario(hotspot: PrismaHotspot, screenIdToSlug: Map<string, string>) {
  const base = {
    hotspot_id: hotspot.slug ?? hotspot.id,
    region: { x: hotspot.regionX, y: hotspot.regionY, width: hotspot.regionWidth, height: hotspot.regionHeight },
    on_success: {
      next_screen: hotspot.nextScreenId ? (screenIdToSlug.get(hotspot.nextScreenId) ?? null) : null,
      score: hotspot.successScore,
    },
    on_error: { hint: hotspot.errorHint ?? "", retry: hotspot.errorRetry },
  };

  if (hotspot.type === "click") {
    return { ...base, type: "click" as const };
  }

  const expected_value =
    hotspot.matchType === "exact"
      ? { match: "exact" as const, value: hotspot.matchValue ?? "" }
      : hotspot.matchType === "regex"
        ? { match: "regex" as const, pattern: hotspot.matchValue ?? "" }
        : { match: "nonEmpty" as const };

  return { ...base, type: "input" as const, expected_value };
}

export function serializeTrainerToScenario(trainer: TrainerWithScreens): Scenario {
  const screenIdToSlug = new Map(trainer.screens.map((s) => [s.id, s.slug ?? s.id]));
  const sortedScreens = trainer.screens.slice().sort((a, b) => a.order - b.order);

  const scenario = {
    schema_version: "1.0",
    trainer_id: trainer.id,
    title: trainer.title,
    language: trainer.language,
    scorm_version: trainer.scormVersion,
    passing_score: trainer.passingScore,
    screens: sortedScreens.map((screen) => ({
      screen_id: screen.slug ?? screen.id,
      image: screen.imageUrl,
      narration: screen.narration ?? undefined,
      hotspots: screen.hotspots
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((hotspot) => serializeHotspotToScenario(hotspot, screenIdToSlug)),
    })),
  };

  return ScenarioSchema.parse(scenario);
}

export async function importScenarioToTrainer(trainerId: string, scenario: Scenario): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.trainer.update({
      where: { id: trainerId },
      data: {
        title: sanitizeText(scenario.title),
        language: scenario.language,
        passingScore: scenario.passing_score,
        scormVersion: scenario.scorm_version,
      },
    });

    await tx.screen.deleteMany({ where: { trainerId } });

    const screenIdMap = new Map<string, string>();
    for (const [index, screen] of scenario.screens.entries()) {
      const created = await tx.screen.create({
        data: {
          trainerId,
          imageUrl: screen.image,
          order: index,
          narration: screen.narration ? sanitizeText(screen.narration) : undefined,
          slug: screen.screen_id,
        },
      });
      screenIdMap.set(screen.screen_id, created.id);
    }

    for (const screen of scenario.screens) {
      const screenDbId = screenIdMap.get(screen.screen_id)!;
      for (const [hotspotIndex, hotspot] of screen.hotspots.entries()) {
        const matchFields = hotspot.type === "input" ? toMatchFields(hotspot.expected_value) : { matchType: null, matchValue: null };
        await tx.hotspot.create({
          data: {
            screenId: screenDbId,
            type: hotspot.type,
            order: hotspotIndex,
            slug: hotspot.hotspot_id,
            regionX: hotspot.region.x,
            regionY: hotspot.region.y,
            regionWidth: hotspot.region.width,
            regionHeight: hotspot.region.height,
            ...matchFields,
            nextScreenId: hotspot.on_success.next_screen ? (screenIdMap.get(hotspot.on_success.next_screen) ?? null) : null,
            successScore: hotspot.on_success.score,
            errorHint: sanitizeText(hotspot.on_error.hint),
            errorRetry: hotspot.on_error.retry,
          },
        });
      }
    }
  });
}
