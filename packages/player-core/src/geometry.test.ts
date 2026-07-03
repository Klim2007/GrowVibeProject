import { describe, expect, it } from "vitest";
import { computeContainRect } from "./geometry.js";

describe("computeContainRect", () => {
  it("letterboxes top/bottom when the image is wider than the container", () => {
    // container 4:3 (800x600), image 16:9 (1600x900) -> image is relatively wider
    const rect = computeContainRect(800, 600, 1600, 900);
    expect(rect.width).toBe(800);
    expect(rect.height).toBeCloseTo(450);
    expect(rect.offsetX).toBe(0);
    expect(rect.offsetY).toBeCloseTo(75);
  });

  it("letterboxes left/right when the image is narrower than the container", () => {
    // container 16:9 (1600x900), image 4:3 (800x600) -> image is relatively narrower
    const rect = computeContainRect(1600, 900, 800, 600);
    expect(rect.height).toBe(900);
    expect(rect.width).toBeCloseTo(1200);
    expect(rect.offsetY).toBe(0);
    expect(rect.offsetX).toBeCloseTo(200);
  });

  it("fills the container exactly when aspect ratios match", () => {
    const rect = computeContainRect(1000, 500, 400, 200);
    expect(rect).toEqual({ width: 1000, height: 500, offsetX: 0, offsetY: 0 });
  });

  it("returns a zero rect for degenerate inputs", () => {
    expect(computeContainRect(0, 500, 400, 200)).toEqual({ width: 0, height: 0, offsetX: 0, offsetY: 0 });
    expect(computeContainRect(500, 500, 0, 200)).toEqual({ width: 0, height: 0, offsetX: 0, offsetY: 0 });
  });

  it("stays proportionally stable across different container sizes (G4: hotspot accuracy across viewports)", () => {
    const small = computeContainRect(400, 300, 1600, 900);
    const large = computeContainRect(1600, 1200, 1600, 900);
    const smallRatio = small.width / small.height;
    const largeRatio = large.width / large.height;
    expect(smallRatio).toBeCloseTo(largeRatio, 5);
  });
});
