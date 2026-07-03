import { describe, expect, it } from "vitest";
import type { Scenario } from "scenario-schema";
import { validateScenarioGraph } from "./validate-graph.js";

function makeScenario(screens: Scenario["screens"]): Scenario {
  return {
    schema_version: "1.0",
    trainer_id: "t1",
    title: "Test",
    language: "ru",
    scorm_version: "1.2",
    passing_score: 80,
    screens,
  };
}

function clickHotspot(id: string, nextScreen: string | null) {
  return {
    hotspot_id: id,
    type: "click" as const,
    region: { x: 0, y: 0, width: 0.1, height: 0.1 },
    on_success: { next_screen: nextScreen, score: 10 },
    on_error: { hint: "", retry: true },
  };
}

describe("validateScenarioGraph", () => {
  it("passes a valid linear scenario with no errors or warnings", () => {
    const scenario = makeScenario([
      { screen_id: "s1", image: "a.png", hotspots: [clickHotspot("h1", "s2")] },
      { screen_id: "s2", image: "b.png", hotspots: [clickHotspot("h2", null)] },
    ]);
    const result = validateScenarioGraph(scenario);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it("errors when a hotspot references a nonexistent next_screen", () => {
    const scenario = makeScenario([
      { screen_id: "s1", image: "a.png", hotspots: [clickHotspot("h1", "does_not_exist")] },
    ]);
    const result = validateScenarioGraph(scenario);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("does_not_exist");
  });

  it("warns about a screen unreachable from the first screen", () => {
    const scenario = makeScenario([
      { screen_id: "s1", image: "a.png", hotspots: [clickHotspot("h1", null)] },
      { screen_id: "orphan", image: "b.png", hotspots: [] },
    ]);
    const result = validateScenarioGraph(scenario);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("orphan");
  });

  it("does not warn about a branching scenario where all screens are reachable", () => {
    const scenario = makeScenario([
      { screen_id: "s1", image: "a.png", hotspots: [clickHotspot("h1", "s2"), clickHotspot("h1b", "s3")] },
      { screen_id: "s2", image: "b.png", hotspots: [clickHotspot("h2", null)] },
      { screen_id: "s3", image: "c.png", hotspots: [clickHotspot("h3", null)] },
    ]);
    const result = validateScenarioGraph(scenario);
    expect(result.warnings).toEqual([]);
  });
});
