import type { Scenario } from "scenario-schema";

export interface GraphValidationResult {
  errors: string[];
  warnings: string[];
}

/**
 * Referential integrity (blocking) + reachability-from-first-screen (warning
 * only) checks, addressing the PRD §12 "dead-end / unreachable screen" risk.
 */
export function validateScenarioGraph(scenario: Scenario): GraphValidationResult {
  const screenIds = new Set(scenario.screens.map((s) => s.screen_id));
  const errors: string[] = [];

  for (const screen of scenario.screens) {
    for (const hotspot of screen.hotspots) {
      const next = hotspot.on_success.next_screen;
      if (next && !screenIds.has(next)) {
        errors.push(
          `Hotspot "${hotspot.hotspot_id}" on screen "${screen.screen_id}" references unknown next_screen "${next}"`,
        );
      }
    }
  }

  const warnings: string[] = [];
  if (scenario.screens.length > 0) {
    const byId = new Map(scenario.screens.map((s) => [s.screen_id, s]));
    const reachable = new Set<string>([scenario.screens[0].screen_id]);
    const queue = [scenario.screens[0].screen_id];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const screen = byId.get(currentId);
      if (!screen) continue;
      for (const hotspot of screen.hotspots) {
        const next = hotspot.on_success.next_screen;
        if (next && screenIds.has(next) && !reachable.has(next)) {
          reachable.add(next);
          queue.push(next);
        }
      }
    }

    for (const screen of scenario.screens) {
      if (!reachable.has(screen.screen_id)) {
        warnings.push(`Screen "${screen.screen_id}" is not reachable from the first screen`);
      }
    }
  }

  return { errors, warnings };
}
