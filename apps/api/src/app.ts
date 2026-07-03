import path from "node:path";
import cors from "cors";
import express from "express";
import { env } from "./lib/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { trainersRouter } from "./routes/trainers.js";
import { screensRouter } from "./routes/screens.js";
import { hotspotsRouter } from "./routes/hotspots.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/uploads", express.static(path.resolve(env.UPLOAD_DIR)));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/trainers", trainersRouter);
  app.use("/api/screens", screensRouter);
  app.use("/api/hotspots", hotspotsRouter);

  app.use(errorHandler);

  return app;
}
