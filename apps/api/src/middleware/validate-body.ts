import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodType } from "zod";

export function validateBody(schema: ZodType): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: "validation_error", issues: result.error.issues });
      return;
    }
    req.body = result.data;
    next();
  };
}
