import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { validateBody } from "../middleware/validate-body.js";
import { serializeHotspot } from "../services/serializers.js";
import { toHotspotUpdateData } from "../services/hotspot-mapper.js";
import { updateHotspotSchema } from "./hotspots.schemas.js";

export const hotspotsRouter = Router();

hotspotsRouter.patch("/:id", validateBody(updateHotspotSchema), async (req, res, next) => {
  try {
    const input = req.body as ReturnType<typeof updateHotspotSchema.parse>;
    const hotspot = await prisma.hotspot.update({
      where: { id: req.params.id },
      data: toHotspotUpdateData(input),
    });
    res.json(serializeHotspot(hotspot));
  } catch (err) {
    next(err);
  }
});

hotspotsRouter.delete("/:id", async (req, res, next) => {
  try {
    await prisma.hotspot.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
