import { describe, expect, it } from "vitest";
import type { InputHotspot } from "scenario-schema";
import { validateClick, validateHotspot, validateInput } from "./validation-engine.js";

function makeInputHotspot(expectedValue: InputHotspot["expected_value"]): InputHotspot {
  return {
    hotspot_id: "h1",
    type: "input",
    region: { x: 0, y: 0, width: 0.1, height: 0.1 },
    expected_value: expectedValue,
    on_success: { next_screen: null, score: 10 },
    on_error: { hint: "try again", retry: true },
  };
}

describe("validateClick", () => {
  it("always succeeds", () => {
    expect(validateClick()).toEqual({ success: true });
  });
});

describe("validateInput", () => {
  it("matches an exact value", () => {
    const hotspot = makeInputHotspot({ match: "exact", value: "KZ-1234567" });
    expect(validateInput(hotspot, "KZ-1234567")).toEqual({ success: true });
    expect(validateInput(hotspot, "kz-1234567")).toEqual({ success: false, hint: "try again" });
  });

  it("matches a regex pattern", () => {
    const hotspot = makeInputHotspot({ match: "regex", pattern: "^KZ-\\d{7}$" });
    expect(validateInput(hotspot, "KZ-1234567").success).toBe(true);
    expect(validateInput(hotspot, "KZ-123").success).toBe(false);
  });

  it("accepts any non-empty value", () => {
    const hotspot = makeInputHotspot({ match: "nonEmpty" });
    expect(validateInput(hotspot, "anything").success).toBe(true);
    expect(validateInput(hotspot, "   ").success).toBe(false);
    expect(validateInput(hotspot, "").success).toBe(false);
  });
});

describe("validateHotspot", () => {
  it("dispatches to validateClick for click hotspots", () => {
    const hotspot = {
      hotspot_id: "c1",
      type: "click" as const,
      region: { x: 0, y: 0, width: 0.1, height: 0.1 },
      on_success: { next_screen: null, score: 5 },
      on_error: { hint: "", retry: true },
    };
    expect(validateHotspot(hotspot)).toEqual({ success: true });
  });

  it("dispatches to validateInput for input hotspots", () => {
    const hotspot = makeInputHotspot({ match: "nonEmpty" });
    expect(validateHotspot(hotspot, "hi").success).toBe(true);
    expect(validateHotspot(hotspot, "").success).toBe(false);
  });
});
