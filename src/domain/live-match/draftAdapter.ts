import { championPool } from "../champions";
import type {
  MatchDraftSummary,
  MatchFormat,
  Role,
} from "../../types/game";
import {
  secondPhasePickRoleIndices,
  type DraftPickOrder,
} from "./draftPickOrder";
import {
  getLiveMatchChampionSummary,
  liveMatchRoles,
} from "./mockDraft";
import type {
  LiveMatchChampionSummary,
  LiveMatchDraftPresentation,
  LiveMatchTeamPresentation,
} from "./types";

const firstPhaseBanCount = 3;
const secondPhaseBanCount = 2;

// The second-phase bans (slots 3 and 4) target the opponent's two roles that are still
// hidden when the second ban phase happens (their 4th and 5th picks). We deny the
// strongest meta champions from the COMBINED pool of those two roles, skipping anything
// already picked, banned, or unavailable by fearless rules.
function chooseSecondPhaseBanIds({
  excludeIds,
  fallbackBanIds,
  openRoleIndices,
}: {
  excludeIds: Set<string>;
  fallbackBanIds: string[];
  openRoleIndices: number[];
}): string[] {
  const openRoles = openRoleIndices.map((index) => liveMatchRoles[index]);
  const banIds = championPool
    .filter(
      (champion) =>
        !excludeIds.has(champion.id) &&
        champion.roles.some((role) => openRoles.includes(role)),
    )
    .sort((first, second) => second.metaScore - first.metaScore)
    .slice(0, secondPhaseBanCount)
    .map((champion) => champion.id);

  // Insurance: if the pool somehow runs dry, keep the original second-phase bans so the
  // slot count never shrinks.
  for (const id of fallbackBanIds) {
    if (banIds.length >= secondPhaseBanCount) {
      break;
    }

    if (id && !banIds.includes(id) && !excludeIds.has(id)) {
      banIds.push(id);
    }
  }

  return banIds;
}

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
  pickOrder,
  usedChampionIdsByGame,
}: {
  draft: MatchDraftSummary;
  format: MatchFormat;
  pickOrder: DraftPickOrder;
  usedChampionIdsByGame: string[][];
}): LiveMatchDraftPresentation {
  const rowCount = Math.max(
    fearlessRowCountByFormat[format],
    usedChampionIdsByGame.length,
  );

  const blueBanIds = [...getBanChampionIds(draft, "blue")];
  const redBanIds = [...getBanChampionIds(draft, "red")];

  // Everything that can't be a fresh second-phase ban: every pick, every previous
  // game's pick (fearless), and the first-phase bans of both sides.
  const baseExcludedIds = new Set<string>([
    ...getDraftPickChampionIds(draft),
    ...usedChampionIdsByGame.flat(),
    ...blueBanIds.slice(0, firstPhaseBanCount),
    ...redBanIds.slice(0, firstPhaseBanCount),
  ]);

  // Blue denies red's two still-hidden roles; red denies blue's, also steering clear of
  // whatever blue just took so the same champion is never banned twice.
  const blueSecondBanIds = chooseSecondPhaseBanIds({
    excludeIds: baseExcludedIds,
    fallbackBanIds: blueBanIds.slice(firstPhaseBanCount),
    openRoleIndices: secondPhasePickRoleIndices(pickOrder.red),
  });
  const redSecondBanIds = chooseSecondPhaseBanIds({
    excludeIds: new Set([...baseExcludedIds, ...blueSecondBanIds]),
    fallbackBanIds: redBanIds.slice(firstPhaseBanCount),
    openRoleIndices: secondPhasePickRoleIndices(pickOrder.blue),
  });

  return {
    blueBans: toChampionSummaries([
      ...blueBanIds.slice(0, firstPhaseBanCount),
      ...blueSecondBanIds,
    ]),
    fearlessRows: Array.from({ length: rowCount }, (_, index) => ({
      champions: toChampionSummaries(usedChampionIdsByGame[index] ?? []),
      label: `G${index + 1}`,
    })),
    redBans: toChampionSummaries([
      ...redBanIds.slice(0, firstPhaseBanCount),
      ...redSecondBanIds,
    ]),
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
