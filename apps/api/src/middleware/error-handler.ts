import type { ErrorRequestHandler } from "express";

interface HttpError extends Error {
  status?: number;
  code?: string;
}

export const errorHandler: ErrorRequestHandler = (err: HttpError, _req, res, _next) => {
  if (err.code === "P2025") {
    res.status(404).json({ error: "not_found" });
    return;
  }
  if (err.code === "P2003") {
    res.status(400).json({ error: "invalid_reference" });
    return;
  }

  console.error(err);
  const status = err.status ?? 500;
  res.status(status).json({ error: status === 500 ? "internal_error" : err.message });
};
