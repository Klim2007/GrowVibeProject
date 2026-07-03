import { describe, expect, it } from "vitest";
import { parseScenario } from "./index.js";
import { legalAddressChangeScenario } from "./fixtures/legal-address-change.js";

describe("parseScenario", () => {
  it("parses the PRD Appendix A example scenario", () => {
    const scenario = parseScenario(legalAddressChangeScenario);
    expect(scenario.trainer_id).toBe("legal-address-change-v1");
    expect(scenario.schema_version).toBe("1.0");
    expect(scenario.screens).toHaveLength(2);
    expect(scenario.screens[0].hotspots[0].type).toBe("input");
  });

  it("rejects an input hotspot missing expected_value", () => {
    const broken = structuredClone(legalAddressChangeScenario);
    delete broken.screens[0].hotspots[0].expected_value;
    expect(() => parseScenario(broken)).toThrow(/expected_value/);
  });

  it("rejects a region where x + width exceeds 1", () => {
    const broken = structuredClone(legalAddressChangeScenario);
    broken.screens[0].hotspots[0].region = { x: 0.8, y: 0.1, width: 0.4, height: 0.05 };
    expect(() => parseScenario(broken)).toThrow(/width/);
  });

  it("rejects a region with an out-of-range coordinate", () => {
    const broken = structuredClone(legalAddressChangeScenario);
    broken.screens[0].hotspots[0].region = { x: 1.2, y: 0.1, width: 0.1, height: 0.05 };
    expect(() => parseScenario(broken)).toThrow();
  });

  it("rejects a scenario with no screens", () => {
    const broken = { ...structuredClone(legalAddressChangeScenario), screens: [] };
    expect(() => parseScenario(broken)).toThrow();
  });

  it("rejects an unsupported hotspot type", () => {
    const broken = structuredClone(legalAddressChangeScenario);
    broken.screens[1].hotspots[0].type = "select";
    expect(() => parseScenario(broken)).toThrow();
  });

  it("rejects an invalid regex pattern", () => {
    const broken = structuredClone(legalAddressChangeScenario);
    broken.screens[0].hotspots[0].expected_value.pattern = "[unterminated";
    expect(() => parseScenario(broken)).toThrow();
  });
});
