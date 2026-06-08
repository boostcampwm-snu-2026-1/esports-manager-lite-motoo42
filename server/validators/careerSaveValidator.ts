import { ObjectId } from "mongodb";
import { BadRequestError } from "../errors/httpErrors.js";
import type { CareerSave } from "../../src/types/game.js";

export function assertCareerSavePayload(value: unknown): asserts value is CareerSave {
  if (!value || typeof value !== "object") {
    throw new BadRequestError("career is required.");
  }

  const career = value as Partial<CareerSave>;

  if (!career.userTeam || !career.seasonState || !career.currentSeason) {
    throw new BadRequestError("career payload is not a valid CareerSave.");
  }
}

export function toCareerSaveObjectId(saveId: string) {
  if (!ObjectId.isValid(saveId)) {
    throw new BadRequestError("Invalid save id.");
  }

  return new ObjectId(saveId);
}
