import type { Role } from "../../types/game";
import type { Champion } from "../champions";
import type { MatchItem } from "../items";

export type LiveMatchSide = "blue" | "red";

export type LiveMatchTimelineEventType =
  | "objective"
  | "fight"
  | "setup"
  | "finish";

export type LiveMatchEventAdvantage = LiveMatchSide | "neutral";

export type LiveMatchImportance = "low" | "medium" | "high" | "critical";

export type LiveMatchObjectiveSnapshot = {
  barons: number;
  dragons: number;
  heralds: number;
  towers: number;
};

export type LiveMatchChampionSummary = Pick<
  Champion,
  "dataDragonId" | "iconUrl" | "id" | "name"
>;

export type LiveMatchItemSlot = MatchItem | null;

export type LiveMatchPlayerStats = {
  assists: number;
  deaths: number;
  gold: string;
  itemSlots: LiveMatchItemSlot[];
  kills: number;
  level: number;
};

export type LiveMatchPlayerPresentation = {
  champion: LiveMatchChampionSummary;
  name: string;
  portraitUrl?: string;
  role: Role;
  stats: LiveMatchPlayerStats;
};

export type LiveMatchTeamPresentation = {
  gold: string;
  id: string;
  kills: number;
  name: string;
  objectives: LiveMatchObjectiveSnapshot;
  players: LiveMatchPlayerPresentation[];
  shortName: string;
};

export type LiveMatchFearlessRow = {
  champions: LiveMatchChampionSummary[];
  label: string;
};

export type LiveMatchDraftPresentation = {
  blueBans: LiveMatchChampionSummary[];
  fearlessRows: LiveMatchFearlessRow[];
  redBans: LiveMatchChampionSummary[];
};

export type LiveMatchTimelineEvent = {
  advantage: LiveMatchEventAdvantage;
  body: string;
  importance: LiveMatchImportance;
  time: string;
  title: string;
  type: LiveMatchTimelineEventType;
};

export type LiveMatchSetPresentation = {
  blueTeam: LiveMatchTeamPresentation;
  draft: LiveMatchDraftPresentation;
  gameNumber: number;
  gameTime: string;
  redTeam: LiveMatchTeamPresentation;
  stageName: string;
  timelineEvents: LiveMatchTimelineEvent[];
};

export type LiveMatchPresentation = {
  currentSet: LiveMatchSetPresentation;
  formatLabel: string;
  id: string;
  stageName: string;
};
