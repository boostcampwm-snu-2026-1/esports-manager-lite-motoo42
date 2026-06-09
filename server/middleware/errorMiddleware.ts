import type { NextFunction, Request, Response } from "express";
import type { AppError } from "../errors/httpErrors.js";

export function errorMiddleware(
  error: AppError,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  const status = error.status ?? 500;

  response.status(status).json({
    error: status === 500 ? "Internal server error." : error.message,
    ...(typeof error.currentRevision === "number"
      ? { currentRevision: error.currentRevision }
      : {}),
  });
}
