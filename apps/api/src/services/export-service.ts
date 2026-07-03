import path from "node:path";
import type { Prisma } from "@prisma/client";
import { exportScormPackage, type ExportAsset } from "scorm-export";
import { env } from "../lib/env.js";
import { prisma } from "../lib/prisma.js";
import { storage } from "../lib/storage.js";
import { serializeTrainerToScenario } from "./scenario-serializer.js";

const exportTrainerInclude = {
  screens: {
    orderBy: { order: "asc" },
    include: { hotspots: { orderBy: { order: "asc" } } },
  },
} satisfies Prisma.TrainerInclude;

export interface ExportTrainerResult {
  downloadUrl: string;
  sizeBytes: number;
  warnings: string[];
}

export async function exportTrainerToScormPackage(trainerId: string): Promise<ExportTrainerResult> {
  const trainer = await prisma.trainer.findUniqueOrThrow({
    where: { id: trainerId },
    include: exportTrainerInclude,
  });

  const scenario = serializeTrainerToScenario(trainer);

  const assets: ExportAsset[] = await Promise.all(
    trainer.screens.map(async (screen) => ({
      screenId: screen.slug ?? screen.id,
      buffer: await storage.getObjectBuffer(storage.keyFromPublicUrl(screen.imageUrl)),
    })),
  );

  const { zipBuffer, sizeBytes, warnings } = await exportScormPackage(scenario, assets, {
    playerBundleDir: path.resolve(env.PLAYER_BUNDLE_DIR),
    imageMaxDimension: env.IMAGE_MAX_DIMENSION,
    imageQuality: env.IMAGE_QUALITY,
    maxPackageSizeBytes: env.MAX_PACKAGE_SIZE_MB * 1024 * 1024,
  });

  const key = `exports/${trainerId}/${Date.now()}.zip`;
  const { url } = await storage.putObject(zipBuffer, key);

  return { downloadUrl: url, sizeBytes, warnings };
}
