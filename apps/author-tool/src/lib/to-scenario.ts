import type { Hotspot as ScenarioHotspot, Scenario, Screen as ScenarioScreen } from "scenario-schema";
import { assetUrl } from "../api/client.js";
import type { HotspotDto, TrainerDto } from "../api/types.js";

function toScenarioHotspot(hotspot: HotspotDto, resolveNextScreen: (screenDbId: string | null) => string | null): ScenarioHotspot {
  const base = {
    hotspot_id: hotspot.slug ?? hotspot.id,
    region: hotspot.region,
    on_success: {
      next_screen: resolveNextScreen(hotspot.onSuccess.nextScreenId),
      score: hotspot.onSuccess.score,
    },
    on_error: { hint: hotspot.onError.hint, retry: hotspot.onError.retry },
  };

  if (hotspot.type === "click") {
    return { ...base, type: "click" };
  }
  return { ...base, type: "input", expected_value: hotspot.expectedValue ?? { match: "nonEmpty" } };
}

/**
 * Converts the Author Tool's live in-memory draft (Zustand/API DTO shape)
 * into the interoperable scenario-schema shape, so the preview can feed the
 * exact same rendering/validation code (player-core) that the real
 * exported Runtime Player uses — no server round-trip required.
 */
export function trainerToScenario(trainer: TrainerDto): Scenario {
  const screenIdToScenarioId = new Map(trainer.screens.map((s) => [s.id, s.slug ?? s.id]));
  const resolveNextScreen = (screenDbId: string | null) =>
    screenDbId ? (screenIdToScenarioId.get(screenDbId) ?? null) : null;

  const screens: ScenarioScreen[] = trainer.screens
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((screen) => ({
      screen_id: screen.slug ?? screen.id,
      image: assetUrl(screen.imageUrl),
      narration: screen.narration ?? undefined,
      hotspots: screen.hotspots
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((hotspot) => toScenarioHotspot(hotspot, resolveNextScreen)),
    }));

  return {
    schema_version: "1.0",
    trainer_id: trainer.id,
    title: trainer.title,
    language: trainer.language,
    scorm_version: "1.2",
    passing_score: trainer.passingScore,
    screens,
  };
}
