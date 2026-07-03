import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { validateBody } from "../middleware/validate-body.js";
import { serializeHotspot, serializeScreen } from "../services/serializers.js";
import { sanitizeOptionalText } from "../services/sanitize.js";
import { toHotspotCreateData } from "../services/hotspot-mapper.js";
import { createHotspotSchema } from "./hotspots.schemas.js";
import { updateScreenSchema } from "./screens.schemas.js";

export const screensRouter = Router();

screensRouter.patch("/:id", validateBody(updateScreenSchema), async (req, res, next) => {
  try {
    const input = req.body as ReturnType<typeof updateScreenSchema.parse>;
    const screen = await prisma.screen.update({
      where: { id: req.params.id },
      data: { ...input, narration: sanitizeOptionalText(input.narration) },
      include: { hotspots: { orderBy: { order: "asc" } } },
    });
    res.json(serializeScreen(screen));
  } catch (err) {
    next(err);
  }
});

screensRouter.delete("/:id", async (req, res, next) => {
  try {
    await prisma.screen.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

screensRouter.post("/:id/hotspots", validateBody(createHotspotSchema), async (req, res, next) => {
  try {
    const input = req.body as ReturnType<typeof createHotspotSchema.parse>;
    const hotspotCount = await prisma.hotspot.count({ where: { screenId: req.params.id } });
    const hotspot = await prisma.hotspot.create({
      data: toHotspotCreateData(req.params.id, input, hotspotCount),
    });
    res.status(201).json(serializeHotspot(hotspot));
  } catch (err) {
    next(err);
  }
});
