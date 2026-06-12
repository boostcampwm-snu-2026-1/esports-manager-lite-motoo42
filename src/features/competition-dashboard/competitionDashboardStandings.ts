import { getLckCupGroupBattleTable } from "../../domain/season";
import type { CompetitionState, MatchRecord, StandingEntry } from "../../types/game";
import { isLateLckRoundsCompetition } from "./competitionDashboardFormatters";

export function getUserTeamId(competition: CompetitionState | undefined) {
  return competition?.standings.find((entry) => entry.isUserTeam)?.teamId;
}

export function compareStandingEntries(left: StandingEntry, right: StandingEntry) {
  const winDiff = right.wins - left.wins;

  if (winDiff !== 0) {
    return winDiff;
  }

  const setDiffLeft = left.setWins - left.setLosses;
  const setDiffRight = right.setWins - right.setLosses;
  const setDiff = setDiffRight - setDiffLeft;

  if (setDiff !== 0) {
    return setDiff;
  }

  const setWinsDiff = right.setWins - left.setWins;

  if (setWinsDiff !== 0) {
    return setWinsDiff;
  }

  return left.initialSeed - right.initialSeed;
}

export function getSortedTable(competition: CompetitionState, records: MatchRecord[]) {
  if (competition.competitionId === "lck-cup") {
    return getLckCupGroupBattleTable(competition, records);
  }

  if (isLateLckRoundsCompetition(competition)) {
    const groupOrder = { legend: 0, rise: 1 };

    return [...competition.standings].sort((left, right) => {
      const leftGroupOrder =
        left.lckRoundsGroup === "legend" || left.lckRoundsGroup === "rise"
          ? groupOrder[left.lckRoundsGroup]
          : 2;
      const rightGroupOrder =
        right.lckRoundsGroup === "legend" || right.lckRoundsGroup === "rise"
          ? groupOrder[right.lckRoundsGroup]
          : 2;

      if (leftGroupOrder !== rightGroupOrder) {
        return leftGroupOrder - rightGroupOrder;
      }

      return compareStandingEntries(left, right);
    });
  }

  return [...competition.standings].sort((left, right) => {
    return compareStandingEntries(left, right);
  });
}
