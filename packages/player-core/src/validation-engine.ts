import type { ExpectedValue, Hotspot, InputHotspot } from "scenario-schema";
import type { ValidationResult } from "./types.js";

export function validateClick(): ValidationResult {
  // A click hotspot's own DOM element is the hit target, so landing a
  // click event on it already proves success — no extra geometry check.
  return { success: true };
}

export function validateInput(hotspot: InputHotspot, value: string): ValidationResult {
  const success = matchesExpectedValue(hotspot.expected_value, value);
  return success ? { success: true } : { success: false, hint: hotspot.on_error.hint };
}

export function validateHotspot(hotspot: Hotspot, value?: string): ValidationResult {
  if (hotspot.type === "click") return validateClick();
  return validateInput(hotspot, value ?? "");
}

function matchesExpectedValue(expected: ExpectedValue, value: string): boolean {
  switch (expected.match) {
    case "exact":
      return value === expected.value;
    case "regex":
      return new RegExp(expected.pattern).test(value);
    case "nonEmpty":
      return value.trim().length > 0;
  }
}
