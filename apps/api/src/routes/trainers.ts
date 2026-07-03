import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { validateBody } from "../middleware/validate-body.js";
import { upload } from "../middleware/upload.js";
import { parseScenario } from "scenario-schema";
import { serializeScreen, serializeTrainer } from "../services/serializers.js";
import { sanitizeOptionalText, sanitizeText } from "../services/sanitize.js";
import { storeUploadedScreenImage } from "../services/asset-service.js";
import { importScenarioToTrainer, serializeTrainerToScenario } from "../services/scenario-serializer.js";
import { exportTrainerToScormPackage } from "../services/export-service.js";
import { HttpError } from "../lib/http-error.js";
import { createTrainerSchema, reorderScreensSchema, updateTrainerSchema } from "./trainers.schemas.js";
import { createScreenSchema } from "./screens.schemas.js";

const trainerInclude = {
  screens: {
    orderBy: { order: "asc" },
    include: { hotspots: { orderBy: { order: "asc" } } },
  },
} satisfies Prisma.TrainerInclude;

export const trainersRouter = Router();

trainersRouter.get("/", async (_req, res) => {
  const trainers = await prisma.trainer.findMany({
    select: { id: true, title: true, status: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
  res.json(trainers);
});

trainersRouter.post("/", validateBody(createTrainerSchema), async (req, res) => {
  const input = req.body as ReturnType<typeof createTrainerSchema.parse>;
  const trainer = await prisma.trainer.create({
    data: { ...input, title: sanitizeText(input.title) },
    include: trainerInclude,
  });
  res.status(201).json(serializeTrainer(trainer));
});

trainersRouter.get("/:id", async (req, res, next) => {
  try {
    const trainer = await prisma.trainer.findUniqueOrThrow({
      where: { id: req.params.id },
      include: trainerInclude,
    });
    res.json(serializeTrainer(trainer));
  } catch (err) {
    next(err);
  }
});

trainersRouter.patch("/:id", validateBody(updateTrainerSchema), async (req, res, next) => {
  try {
    const input = req.body as ReturnType<typeof updateTrainerSchema.parse>;
    const trainer = await prisma.trainer.update({
      where: { id: req.params.id },
      data: { ...input, title: sanitizeOptionalText(input.title) },
      include: trainerInclude,
    });
    res.json(serializeTrainer(trainer));
  } catch (err) {
    next(err);
  }
});

trainersRouter.delete("/:id", async (req, res, next) => {
  try {
    await prisma.trainer.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

trainersRouter.post("/:id/screens", validateBody(createScreenSchema), async (req, res, next) => {
  try {
    const input = req.body as ReturnType<typeof createScreenSchema.parse>;
    const screenCount = await prisma.screen.count({ where: { trainerId: req.params.id } });
    const screen = await prisma.screen.create({
      data: {
        trainerId: req.params.id,
        imageUrl: input.imageUrl,
        order: input.order ?? screenCount,
        narration: sanitizeOptionalText(input.narration),
        slug: input.slug,
      },
      include: { hotspots: true },
    });
    res.status(201).json(serializeScreen(screen));
  } catch (err) {
    next(err);
  }
});

trainersRouter.post("/:id/screens/reorder", validateBody(reorderScreensSchema), async (req, res, next) => {
  try {
    const input = req.body as ReturnType<typeof reorderScreensSchema.parse>;
    await prisma.$transaction(
      input.map((entry) =>
        prisma.screen.update({
          where: { id: entry.id, trainerId: req.params.id },
          data: { order: entry.order },
        }),
      ),
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

trainersRouter.get("/:id/scenario.json", async (req, res, next) => {
  try {
    const trainer = await prisma.trainer.findUniqueOrThrow({
      where: { id: req.params.id },
      include: trainerInclude,
    });
    res.json(serializeTrainerToScenario(trainer));
  } catch (err) {
    next(err);
  }
});

trainersRouter.post("/:id/scenario/import", async (req, res, next) => {
  try {
    const scenario = parseScenario(req.body);
    await importScenarioToTrainer(req.params.id, scenario);
    const trainer = await prisma.trainer.findUniqueOrThrow({
      where: { id: req.params.id },
      include: trainerInclude,
    });
    res.json(serializeTrainer(trainer));
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Invalid scenario JSON")) {
      next(new HttpError(400, err.message));
      return;
    }
    next(err);
  }
});

trainersRouter.post("/:id/export", async (req, res, next) => {
  try {
    const result = await exportTrainerToScormPackage(req.params.id);
    res.json(result);
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Scenario graph is invalid")) {
      next(new HttpError(400, err.message));
      return;
    }
    next(err);
  }
});

trainersRouter.post("/:id/assets", upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new HttpError(400, "missing_file");
    }
    const result = await storeUploadedScreenImage(req.params.id, req.file.buffer);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});
