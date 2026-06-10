import type { Player } from "../../types/game";

const aiProtectedMainRosterCount = 2;

function normalizeTeamName(value: string | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function getPlayerMarketRank(player: Player) {
  return player.overall * 1.5 + player.potential * 0.3;
}

function sortProtectedPlayers(left: Player, right: Player) {
  const rankDiff = getPlayerMarketRank(right) - getPlayerMarketRank(left);

  if (rankDiff !== 0) {
    return rankDiff;
  }

  return left.id.localeCompare(right.id);
}

export function releaseAiMainRosterToMarket(
  players: Player[],
  userTeamName: string,
) {
  const userTeamKey = normalizeTeamName(userTeamName);
  const playersByTeam = new Map<string, Player[]>();

  players.forEach((player) => {
    const teamKey = normalizeTeamName(player.currentTeam);

    if (
      !teamKey ||
      teamKey === userTeamKey ||
      player.region !== "lck" ||
      player.league !== "LCK" ||
      player.rosterTier !== "main" ||
      !player.availableForRoster
    ) {
      return;
    }

    playersByTeam.set(teamKey, [...(playersByTeam.get(teamKey) ?? []), player]);
  });

  const releasedIds = new Set<string>();

  playersByTeam.forEach((teamPlayers) => {
    const protectedIds = new Set(
      [...teamPlayers]
        .sort(sortProtectedPlayers)
        .slice(0, aiProtectedMainRosterCount)
        .map((player) => player.id),
    );

    teamPlayers.forEach((player) => {
      if (!protectedIds.has(player.id)) {
        releasedIds.add(player.id);
      }
    });
  });

  if (releasedIds.size === 0) {
    return {
      players,
      releasedPlayerIds: [],
    };
  }

  return {
    players: players.map((player) =>
      releasedIds.has(player.id)
        ? {
            ...player,
            currentTeam: undefined,
          }
        : player,
    ),
    releasedPlayerIds: [...releasedIds],
  };
}
