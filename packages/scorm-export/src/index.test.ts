import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import JSZip from "jszip";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Scenario } from "scenario-schema";
import { exportScormPackage } from "./index.js";

async function makePngBuffer(width: number, height: number): Promise<Buffer> {
  return sharp({ create: { width, height, channels: 3, background: { r: 100, g: 120, b: 200 } } })
    .png()
    .toBuffer();
}

const scenario: Scenario = {
  schema_version: "1.0",
  trainer_id: "trainer-abc",
  title: "Тестовый тренажёр",
  language: "ru",
  scorm_version: "1.2",
  passing_score: 80,
  screens: [
    {
      screen_id: "screen_one",
      image: "placeholder.png",
      hotspots: [
        {
          hotspot_id: "hotspot_one",
          type: "click",
          region: { x: 0.1, y: 0.1, width: 0.2, height: 0.2 },
          on_success: { next_screen: "screen_two", score: 50 },
          on_error: { hint: "", retry: true },
        },
      ],
    },
    {
      screen_id: "screen_two",
      image: "placeholder.png",
      hotspots: [
        {
          hotspot_id: "hotspot_two",
          type: "input",
          region: { x: 0.3, y: 0.3, width: 0.2, height: 0.1 },
          expected_value: { match: "nonEmpty" },
          on_success: { next_screen: null, score: 50 },
          on_error: { hint: "try again", retry: true },
        },
      ],
    },
  ],
};

describe("exportScormPackage", () => {
  let playerBundleDir: string;

  beforeEach(async () => {
    playerBundleDir = await mkdtemp(path.join(tmpdir(), "player-bundle-"));
    await writeFile(path.join(playerBundleDir, "index.html"), "<html><body>player</body></html>");
    await writeFile(path.join(playerBundleDir, "app.js"), "console.log('player');");
  });

  afterEach(async () => {
    await rm(playerBundleDir, { recursive: true, force: true });
  });

  it("produces a zip with index.html, scenario.json, imsmanifest.xml, and optimized images", async () => {
    const assets = [
      { screenId: "screen_one", buffer: await makePngBuffer(400, 300) },
      { screenId: "screen_two", buffer: await makePngBuffer(400, 300) },
    ];

    const result = await exportScormPackage(scenario, assets, { playerBundleDir });

    expect(result.warnings).toEqual([]);
    expect(result.sizeBytes).toBeGreaterThan(0);

    const zip = await JSZip.loadAsync(result.zipBuffer);
    expect(Object.keys(zip.files)).toEqual(
      expect.arrayContaining(["index.html", "app.js", "scenario.json", "imsmanifest.xml", "assets/screen_one.png", "assets/screen_two.png"]),
    );

    const scenarioJson = JSON.parse(await zip.file("scenario.json")!.async("string"));
    expect(scenarioJson.trainer_id).toBe("trainer-abc");
    expect(scenarioJson.screens[0].image).toBe("assets/screen_one.png");

    const manifest = await zip.file("imsmanifest.xml")!.async("string");
    expect(manifest).toContain('identifier="trainer-abc"');
    expect(manifest).toContain('href="assets/screen_one.png"');
  });

  it("resizes an oversized image to the configured max dimension", async () => {
    const assets = [
      { screenId: "screen_one", buffer: await makePngBuffer(4000, 3000) },
      { screenId: "screen_two", buffer: await makePngBuffer(400, 300) },
    ];

    const result = await exportScormPackage(scenario, assets, { playerBundleDir, imageMaxDimension: 800 });
    const zip = await JSZip.loadAsync(result.zipBuffer);
    const imgBuffer = await zip.file("assets/screen_one.png")!.async("nodebuffer");
    const metadata = await sharp(imgBuffer).metadata();
    expect(metadata.width).toBeLessThanOrEqual(800);
  });

  it("throws when the scenario graph has a dangling next_screen reference", async () => {
    const broken: Scenario = {
      ...scenario,
      screens: [
        {
          screen_id: "screen_one",
          image: "placeholder.png",
          hotspots: [
            {
              hotspot_id: "h1",
              type: "click",
              region: { x: 0, y: 0, width: 0.1, height: 0.1 },
              on_success: { next_screen: "nonexistent", score: 10 },
              on_error: { hint: "", retry: true },
            },
          ],
        },
      ],
    };
    const assets = [{ screenId: "screen_one", buffer: await makePngBuffer(200, 200) }];
    await expect(exportScormPackage(broken, assets, { playerBundleDir })).rejects.toThrow(/nonexistent/);
  });

  it("throws when an asset is missing for a screen", async () => {
    const assets = [{ screenId: "screen_one", buffer: await makePngBuffer(200, 200) }];
    await expect(exportScormPackage(scenario, assets, { playerBundleDir })).rejects.toThrow(/screen_two/);
  });

  it("flags a package approaching the configured size limit as a warning", async () => {
    const assets = [
      { screenId: "screen_one", buffer: await makePngBuffer(400, 300) },
      { screenId: "screen_two", buffer: await makePngBuffer(400, 300) },
    ];
    const result = await exportScormPackage(scenario, assets, { playerBundleDir, maxPackageSizeBytes: 1000 });
    expect(result.warnings.some((w) => w.includes("exceeds"))).toBe(true);
  });
});
