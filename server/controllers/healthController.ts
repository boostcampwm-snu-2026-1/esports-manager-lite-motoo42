import type { NextFunction, Request, Response } from "express";
import { getHealthStatus } from "../services/healthService.js";

export async function getHealthController(
  _request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    response.json(await getHealthStatus());
  } catch (error) {
    next(error);
  }
}
