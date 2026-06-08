import type { WithId } from "mongodb";
import { defaultOwnerId } from "../config.js";
import { CareerSaveConflictError } from "../errors/httpErrors.js";
import {
  careerSaveSchemaVersion,
  type CareerSaveDocument,
  type CareerSaveDto,
  type CareerSaveParticipant,
  type CareerSaveSummary,
} from "../models/careerSave.js";
import {
  createCareerSaveObjectId,
  deleteCareerSaveDocument,
  findCareerSaveDocumentByIdAndOwner,
  insertCareerSaveDocument,
  listCareerSaveDocumentsByOwner,
  updateCareerSaveDocument,
  type CareerSaveDocumentProjection,
} from "../repositories/careerSavesRepository.js";
import {
  assertCareerSavePayload,
  toCareerSaveObjectId,
} from "../validators/careerSaveValidator.js";
import type { CareerSave } from "../../src/types/game.js";

export type CreateCareerSaveInput = {
  career: CareerSave;
  ownerId?: string;
  saveName?: string;
};

export type UpdateCareerSaveInput = CreateCareerSaveInput & {
  expectedRevision?: number;
};

type CareerSaveDtoSource =
  | WithId<CareerSaveDocument>
  | CareerSaveDocumentProjection;

function normalizeOwnerId(ownerId?: string) {
  const normalizedOwnerId = ownerId?.trim();

  return normalizedOwnerId && normalizedOwnerId.length > 0
    ? normalizedOwnerId
    : defaultOwnerId;
}

function getCompetitionName(career: CareerSave) {
  const currentCompetition = career.seasonState.competitions.find(
    (competition) =>
      competition.competitionId === career.seasonState.currentCompetitionId,
  );
  const activeCompetition = career.seasonState.competitions.find(
    (competition) => competition.status === "active",
  );

  return currentCompetition?.name ?? activeCompetition?.name;
}

export function createCareerSaveSummary(career: CareerSave): CareerSaveSummary {
  return {
    teamName: career.userTeam.name,
    seasonNumber: career.currentSeason,
    currentDateLabel: career.seasonState.currentDateLabel,
    currentCompetitionId: career.seasonState.currentCompetitionId,
    currentCompetitionName: getCompetitionName(career),
  };
}

function createDefaultSaveName(career: CareerSave) {
  return `${career.userTeam.name} S${career.currentSeason}`;
}

function createParticipants(
  ownerId: string,
  career: CareerSave,
): CareerSaveParticipant[] {
  return [
    {
      ownerId,
      teamId: career.userTeam.name,
      role: "manager",
    },
  ];
}

function toDto(document: CareerSaveDtoSource): CareerSaveDto {
  const { _id, ...rest } = document;

  return {
    ...rest,
    id: _id.toHexString(),
  } as CareerSaveDto;
}

function getExpectedRevision(expectedRevision?: number) {
  return typeof expectedRevision === "number" &&
    Number.isInteger(expectedRevision) &&
    expectedRevision > 0
    ? expectedRevision
    : undefined;
}

export async function listCareerSaves(ownerId?: string) {
  const saves = await listCareerSaveDocumentsByOwner(normalizeOwnerId(ownerId));

  return saves.map(toDto);
}

export async function getCareerSave(saveId: string, ownerId?: string) {
  const save = await findCareerSaveDocumentByIdAndOwner(
    toCareerSaveObjectId(saveId),
    normalizeOwnerId(ownerId),
  );

  return save ? toDto(save) : null;
}

export async function createCareerSave(input: CreateCareerSaveInput) {
  assertCareerSavePayload(input.career);

  const now = new Date().toISOString();
  const ownerId = normalizeOwnerId(input.ownerId);
  const _id = createCareerSaveObjectId();
  const document: CareerSaveDocument & { _id: typeof _id } = {
    _id,
    schemaVersion: careerSaveSchemaVersion,
    mode: "single-player",
    ownerId,
    worldId: _id.toHexString(),
    saveName: input.saveName?.trim() || createDefaultSaveName(input.career),
    participants: createParticipants(ownerId, input.career),
    revision: 1,
    createdAt: now,
    updatedAt: now,
    summary: createCareerSaveSummary(input.career),
    career: input.career,
  };

  return toDto(await insertCareerSaveDocument(document));
}

export async function updateCareerSave(
  saveId: string,
  input: UpdateCareerSaveInput,
) {
  assertCareerSavePayload(input.career);

  const _id = toCareerSaveObjectId(saveId);
  const ownerId = normalizeOwnerId(input.ownerId);
  const existing = await findCareerSaveDocumentByIdAndOwner(_id, ownerId);
  const expectedRevision = getExpectedRevision(input.expectedRevision);

  if (!existing) {
    return null;
  }

  if (expectedRevision && existing.revision !== expectedRevision) {
    throw new CareerSaveConflictError(existing.revision);
  }

  const now = new Date().toISOString();
  const nextRevision = existing.revision + 1;
  const updateFields = {
    career: input.career,
    participants: existing.participants.length
      ? existing.participants
      : createParticipants(ownerId, input.career),
    saveName: input.saveName?.trim() || existing.saveName,
    schemaVersion: careerSaveSchemaVersion,
    summary: createCareerSaveSummary(input.career),
    updatedAt: now,
  };

  const result = await updateCareerSaveDocument({
    _id,
    expectedRevision,
    ownerId,
    updateFields,
  });

  if (expectedRevision && result.matchedCount === 0) {
    const latest = await findCareerSaveDocumentByIdAndOwner(_id, ownerId);

    if (!latest) {
      return null;
    }

    throw new CareerSaveConflictError(latest.revision);
  }

  return toDto({
    ...existing,
    ...updateFields,
    revision: nextRevision,
    _id,
  });
}

export async function deleteCareerSave(saveId: string, ownerId?: string) {
  return deleteCareerSaveDocument(
    toCareerSaveObjectId(saveId),
    normalizeOwnerId(ownerId),
  );
}
