import { championPool, type Champion } from "../champions";
import type { Role } from "../../types/game";
import type {
  LiveMatchChampionSummary,
  LiveMatchDraftPresentation,
  LiveMatchSide,
} from "./types";

export const liveMatchRoles: Role[] = ["top", "jungle", "mid", "bot", "support"];

export const liveMatchRoleLabels: Record<Role, string> = {
  top: "TOP",
  jungle: "JGL",
  mid: "MID",
  bot: "BOT",
  support: "SUP",
};

const championIdsByRole: Record<Role, [string, string]> = {
  top: ["ksante", "aatrox"],
  jungle: ["vi", "sejuani"],
  mid: ["azir", "orianna"],
  bot: ["xayah", "jinx"],
  support: ["rakan", "nautilus"],
};

const championById = new Map(championPool.map((champion) => [champion.id, champion]));

export function toLiveMatchChampionSummary(
  champion: Champion,
): LiveMatchChampionSummary {
  return {
    dataDragonId: champion.dataDragonId,
    iconUrl: champion.iconUrl,
    id: champion.id,
    name: champion.name,
  };
}

export function getLiveMatchChampionSummary(championId: string) {
  const champion = championById.get(championId);

  if (!champion) {
    throw new Error(`Unknown live match champion id: ${championId}`);
  }

  return toLiveMatchChampionSummary(champion);
}

function getLiveMatchChampionSummaries(championIds: string[]) {
  return championIds.map(getLiveMatchChampionSummary);
}

export const mockLiveMatchDraft: LiveMatchDraftPresentation = {
  blueBans: getLiveMatchChampionSummaries(["ahri", "vi", "varus", "rell", "corki"]),
  redBans: getLiveMatchChampionSummaries(["azir", "rakan", "jinx", "maokai", "gnar"]),
  fearlessRows: [
    {
      label: "G1",
      champions: getLiveMatchChampionSummaries([
        "ahri",
        "vi",
        "varus",
        "rell",
        "corki",
        "azir",
        "rakan",
        "jinx",
        "maokai",
        "gnar",
      ]),
    },
    {
      label: "G2",
      champions: getLiveMatchChampionSummaries([
        "ksante",
        "sejuani",
        "orianna",
        "nautilus",
        "xayah",
        "aatrox",
        "lee-sin",
        "leona",
        "ezreal",
        "taliyah",
      ]),
    },
    {
      label: "G3",
      champions: [],
    },
    {
      label: "G4",
      champions: [],
    },
  ],
};

export function getMockChampionForRole(role: Role, side: LiveMatchSide) {
  const championIndex = side === "blue" ? 0 : 1;

  return getLiveMatchChampionSummary(championIdsByRole[role][championIndex]);
}
