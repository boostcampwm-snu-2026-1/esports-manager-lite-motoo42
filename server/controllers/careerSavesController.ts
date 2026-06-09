import type { NextFunction, Request, Response } from "express";
import {
  createCareerSave,
  deleteCareerSave,
  getCareerSave,
  listCareerSaves,
  updateCareerSave,
} from "../services/careerSavesService.js";

function getOwnerIdFromQuery(request: Request) {
  const ownerId = request.query.ownerId;

  return typeof ownerId === "string" && ownerId.trim() ? ownerId : undefined;
}

function getOwnerIdFromBodyOrQuery(request: Request) {
  const ownerId = request.body?.ownerId;

  return typeof ownerId === "string" && ownerId.trim()
    ? ownerId
    : getOwnerIdFromQuery(request);
}

function getSaveIdFromParams(request: Request) {
  const saveId = request.params.saveId;

  return Array.isArray(saveId) ? saveId[0] ?? "" : saveId;
}

export async function listCareerSavesController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const saves = await listCareerSaves(getOwnerIdFromQuery(request));

    response.json({ saves });
  } catch (error) {
    next(error);
  }
}

export async function createCareerSaveController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const save = await createCareerSave({
      career: request.body.career,
      ownerId: getOwnerIdFromBodyOrQuery(request),
      saveName: request.body.saveName,
    });

    response.status(201).json({ save });
  } catch (error) {
    next(error);
  }
}

export async function getCareerSaveController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const save = await getCareerSave(
      getSaveIdFromParams(request),
      getOwnerIdFromQuery(request),
    );

    if (!save) {
      response.status(404).json({ error: "Save not found." });
      return;
    }

    response.json({ save });
  } catch (error) {
    next(error);
  }
}

export async function updateCareerSaveController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const save = await updateCareerSave(getSaveIdFromParams(request), {
      career: request.body.career,
      expectedRevision: request.body.expectedRevision,
      ownerId: getOwnerIdFromBodyOrQuery(request),
      saveName: request.body.saveName,
    });

    if (!save) {
      response.status(404).json({ error: "Save not found." });
      return;
    }

    response.json({ save });
  } catch (error) {
    next(error);
  }
}

export async function deleteCareerSaveController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const deleted = await deleteCareerSave(
      getSaveIdFromParams(request),
      getOwnerIdFromQuery(request),
    );

    if (!deleted) {
      response.status(404).json({ error: "Save not found." });
      return;
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
}
