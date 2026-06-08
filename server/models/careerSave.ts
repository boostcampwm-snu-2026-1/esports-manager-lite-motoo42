import type { ObjectId } from "mongodb";
import type { CareerSave, CompetitionId } from "../../src/types/game.js";

export const careerSaveCollectionName = "careerSaves";
export const careerSaveSchemaVersion = 1;

type SaveMode = "single-player" | "league-multiplayer";
type ParticipantRole = "commissioner" | "manager";

export type CareerSaveParticipant = {
  ownerId: string;
  teamId: string;
  role: ParticipantRole;
};

export type CareerSaveSummary = {
  teamName: string;
  seasonNumber: number;
  currentDateLabel: string;
  currentCompetitionId: CompetitionId | null;
  currentCompetitionName?: string;
};

export type CareerSaveDocument = {
  _id?: ObjectId;
  schemaVersion: number;
  mode: SaveMode;
  ownerId: string;
  worldId: string;
  saveName: string;
  participants: CareerSaveParticipant[];
  revision: number;
  createdAt: string;
  updatedAt: string;
  summary: CareerSaveSummary;
  career: CareerSave;
};

export type CareerSaveDto = Omit<CareerSaveDocument, "_id" | "career"> & {
  id: string;
  career?: CareerSave;
};
