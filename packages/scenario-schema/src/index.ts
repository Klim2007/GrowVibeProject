import { ScenarioSchema, type Scenario } from "./scenario.js";

export * from "./validation-rules.js";
export * from "./hotspot.js";
export * from "./screen.js";
export * from "./scenario.js";

export function parseScenario(json: unknown): Scenario {
  const result = ScenarioSchema.safeParse(json);
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid scenario JSON: ${message}`);
  }
  return result.data;
}
