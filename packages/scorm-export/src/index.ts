import { readdir } from "node:fs/promises";
import path from "node:path";
import type { Scenario } from "scenario-schema";
import { optimizeImage } from "./image-optimize.js";
import { generateImsManifest12 } from "./manifest/imsmanifest-1.2.js";
import { validateScenarioGraph } from "./validate-graph.js";
import { assembleZip, type ZipEntry } from "./zip-assembler.js";
import type { ExportAsset, ExportOptions, ExportResult } from "./types.js";

export * from "./types.js";
export { validateScenarioGraph } from "./validate-graph.js";

const DEFAULT_MAX_DIMENSION = 1920;
const DEFAULT_QUALITY = 80;
const DEFAULT_MAX_PACKAGE_SIZE_BYTES = 150 * 1024 * 1024;

async function listFilesRecursive(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(dir, path.join(entry.parentPath, entry.name)).split(path.sep).join("/"));
}

export async function exportScormPackage(
  scenario: Scenario,
  assets: ExportAsset[],
  options: ExportOptions,
): Promise<ExportResult> {
  const graph = validateScenarioGraph(scenario);
  if (graph.errors.length > 0) {
    throw new Error(`Scenario graph is invalid: ${graph.errors.join("; ")}`);
  }
  const warnings = [...graph.warnings];

  const assetByScreenId = new Map(assets.map((asset) => [asset.screenId, asset]));
  const entries: ZipEntry[] = [];
  const exportedScreens: Scenario["screens"] = [];

  for (const screen of scenario.screens) {
    const asset = assetByScreenId.get(screen.screen_id);
    if (!asset) {
      throw new Error(`Missing image asset for screen "${screen.screen_id}"`);
    }
    const optimized = await optimizeImage(
      asset.buffer,
      options.imageMaxDimension ?? DEFAULT_MAX_DIMENSION,
      options.imageQuality ?? DEFAULT_QUALITY,
    );
    const fileName = `assets/${screen.screen_id}.${optimized.extension}`;
    entries.push({ path: fileName, content: optimized.buffer });
    exportedScreens.push({ ...screen, image: fileName });
  }

  const exportedScenario: Scenario = { ...scenario, screens: exportedScreens };
  entries.push({ path: "scenario.json", content: Buffer.from(JSON.stringify(exportedScenario, null, 2)) });

  const playerBundleFiles = await listFilesRecursive(options.playerBundleDir);
  const manifestFiles = [...playerBundleFiles, "scenario.json", ...entries.filter((e) => e.path.startsWith("assets/")).map((e) => e.path)];
  const manifest = generateImsManifest12({ identifier: scenario.trainer_id, title: scenario.title, files: manifestFiles });
  entries.push({ path: "imsmanifest.xml", content: Buffer.from(manifest) });

  const zipBuffer = await assembleZip(entries, [{ sourceDir: options.playerBundleDir, destDir: "" }]);

  const sizeBytes = zipBuffer.length;
  const maxSize = options.maxPackageSizeBytes ?? DEFAULT_MAX_PACKAGE_SIZE_BYTES;
  const sizeMb = (sizeBytes / (1024 * 1024)).toFixed(1);
  const maxMb = (maxSize / (1024 * 1024)).toFixed(0);
  if (sizeBytes >= maxSize) {
    warnings.push(`Package size ${sizeMb}MB exceeds the ${maxMb}MB limit common to many corporate LMS`);
  } else if (sizeBytes >= maxSize * 0.8) {
    warnings.push(`Package size ${sizeMb}MB is approaching the ${maxMb}MB limit common to many corporate LMS`);
  }

  return { zipBuffer, sizeBytes, warnings };
}
