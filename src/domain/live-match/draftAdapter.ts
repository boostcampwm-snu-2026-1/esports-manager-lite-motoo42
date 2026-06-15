import type {
  MatchDraftSummary,
  MatchFormat,
  Role,
} from "../../types/game";
import {
  getLiveMatchChampionSummary,
  liveMatchRoles,
} from "./mockDraft";
import type {
  LiveMatchChampionSummary,
  LiveMatchDraftPresentation,
  LiveMatchTeamPresentation,
} from "./types";

const fearlessRowCountByFormat: Record<MatchFormat, number> = {
  bo1: 1,
  bo3: 3,
  bo5: 5,
};

function toChampionSummaries(championIds: string[]) {
  return championIds
    .map((championId) => {
      try {
        return getLiveMatchChampionSummary(championId);
      } catch {
        return null;
      }
    })
    .filter(
      (champion): champion is LiveMatchChampionSummary => champion !== null,
    );
}

function getBanChampionIds(
  draft: MatchDraftSummary,
  side: "blue" | "red",
) {
  return side === "blue" ? draft.blueBanIds ?? [] : draft.redBanIds ?? [];
}

function getPickedChampionId({
  draft,
  role,
  side,
}: {
  draft: MatchDraftSummary;
  role: Role;
  side: "blue" | "red";
}) {
  return side === "blue"
    ? draft.bluePicks[role]?.championId
    : draft.redPicks[role]?.championId;
}

export function createLiveMatchDraftFromSummary({
  draft,
  format,
  usedChampionIdsByGame,
}: {
  draft: MatchDraftSummary;
  format: MatchFormat;
  usedChampionIdsByGame: string[][];
}): LiveMatchDraftPresentation {
  const rowCount = Math.max(
    fearlessRowCountByFormat[format],
    usedChampionIdsByGame.length,
  );

  return {
    blueBans: toChampionSummaries(getBanChampionIds(draft, "blue")),
    fearlessRows: Array.from({ length: rowCount }, (_, index) => ({
      champions: toChampionSummaries(usedChampionIdsByGame[index] ?? []),
      label: `G${index + 1}`,
    })),
    redBans: toChampionSummaries(getBanChampionIds(draft, "red")),
  };
}

function applyDraftPicksToTeam({
  draft,
  side,
  team,
}: {
  draft: MatchDraftSummary;
  side: "blue" | "red";
  team: LiveMatchTeamPresentation;
}): LiveMatchTeamPresentation {
  return {
    ...team,
    players: team.players.map((player) => {
      const championId = getPickedChampionId({
        draft,
        role: player.role,
        side,
      });

      if (!championId) {
        return player;
      }

      return {
        ...player,
        champion: getLiveMatchChampionSummary(championId),
      };
    }),
  };
}

export function applyDraftToLiveMatchTeams({
  blueTeam,
  draft,
  redTeam,
}: {
  blueTeam: LiveMatchTeamPresentation;
  draft: MatchDraftSummary;
  redTeam: LiveMatchTeamPresentation;
}) {
  return {
    blueTeam: applyDraftPicksToTeam({ draft, side: "blue", team: blueTeam }),
    redTeam: applyDraftPicksToTeam({ draft, side: "red", team: redTeam }),
  };
}

export function getDraftPickChampionIds(draft: MatchDraftSummary) {
  return liveMatchRoles
    .flatMap((role) => [
      draft.bluePicks[role]?.championId,
      draft.redPicks[role]?.championId,
    ])
    .filter((championId): championId is string => Boolean(championId));
}
