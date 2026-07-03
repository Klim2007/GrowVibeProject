import { parseScenario, type Scenario } from "scenario-schema";

export async function loadScenario(scenarioUrl: string): Promise<Scenario> {
  const res = await fetch(scenarioUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch scenario at ${scenarioUrl}: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return parseScenario(json);
}

export function resolveAssetUrl(scenarioUrl: string, assetPath: string): string {
  return new URL(assetPath, scenarioUrl).toString();
}
