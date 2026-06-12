import type { CareerSave, CompetitionState, StandingEntry } from "../../types/game";
import { findTeamNameInCompetition } from "./competitionDashboardShared";

export type FirstStandGroupId = "A" | "B";

export type FirstStandEntrant = {
  id: string;
  name: string;
  leagueLabel: string;
  group: FirstStandGroupId;
  seedLabel: string;
  sourceDetail: string;
  strength?: number;
  isLck: boolean;
  isPlaceholder: boolean;
};

export type FirstStandPreviewMatch = {
  id: string;
  dateLabel: string;
  group: FirstStandGroupId;
  stageName: string;
  blueTeamName: string;
  redTeamName: string;
  formatLabel: string;
};

function getFirstStandLckRepresentativeSource(
  career: CareerSave,
  competition: CompetitionState,
) {
  const lckRounds = career.seasonState.competitions.find(
    (candidate) => candidate.competitionId === "lck-rounds-1-2",
  );
  const lckCup = career.seasonState.competitions.find(
    (candidate) => candidate.competitionId === "lck-cup",
  );

  if (lckRounds?.completed && lckRounds.qualifiedTeamIds.length >= 2) {
    return {
      competition: lckRounds,
      detail: "LCK Rounds 1-2 우승/준우승",
    };
  }

  if (competition.qualifiedTeamIds.length >= 2) {
    return {
      competition,
      detail: "First Stand LCK 대표 슬롯",
    };
  }

  if ((lckCup?.qualifiedTeamIds.length ?? 0) >= 2) {
    return {
      competition: lckCup,
      detail: "LCK Cup 결승 진출팀",
    };
  }

  return {
    competition: undefined,
    detail: "LCK 대표 확정 대기",
  };
}

function createFirstStandLckEntrants(
  career: CareerSave,
  competition: CompetitionState,
): FirstStandEntrant[] {
  const source = getFirstStandLckRepresentativeSource(career, competition);

  return [
    {
      group: "A" as const,
      seedLabel: "LCK 1",
    },
    {
      group: "B" as const,
      seedLabel: "LCK 2",
    },
  ].map((slot, index) => {
    const teamId = source.competition?.qualifiedTeamIds[index];
    const teamName =
      findTeamNameInCompetition(source.competition, teamId) ??
      source.competition?.qualifiedTeamNames[index] ??
      `LCK ${index + 1}번 시드`;

    return {
      id: teamId ?? `first-stand-lck-${index + 1}`,
      name: teamName,
      leagueLabel: "LCK",
      group: slot.group,
      seedLabel: slot.seedLabel,
      sourceDetail: source.detail,
      isLck: true,
      isPlaceholder: !teamId,
    };
  });
}

const firstStandInternationalFallbacks = [
  {
    leagueLabel: "LPL",
    name: "Bilibili Gaming",
    seedLabel: "LPL 1",
    group: "B" as const,
    strength: 86,
  },
  {
    leagueLabel: "LPL",
    name: "Top Esports",
    seedLabel: "LPL 2",
    group: "A" as const,
    strength: 84,
  },
  {
    leagueLabel: "LEC",
    name: "G2 Esports",
    seedLabel: "LEC 1",
    group: "A" as const,
    strength: 82,
  },
  {
    leagueLabel: "LCS",
    name: "Cloud9",
    seedLabel: "LCS 1",
    group: "B" as const,
    strength: 76,
  },
  {
    leagueLabel: "LCP",
    name: "PSG Talon",
    seedLabel: "LCP 1",
    group: "B" as const,
    strength: 74,
  },
  {
    leagueLabel: "CBLOL",
    name: "LOUD",
    seedLabel: "CBLOL 1",
    group: "A" as const,
    strength: 70,
  },
];

function createFirstStandInternationalEntrants(career: CareerSave) {
  const usedOpponentIds = new Set<string>();

  return firstStandInternationalFallbacks.map((fallback, index) => {
    const opponent = career.internationalOpponents
      .filter(
        (candidate) =>
          candidate.leagueLabel === fallback.leagueLabel &&
          candidate.appearsIn.includes("first-stand") &&
          !usedOpponentIds.has(candidate.id),
      )
      .sort((left, right) => right.strength - left.strength)[0];

    if (opponent) {
      usedOpponentIds.add(opponent.id);
    }

    return {
      id:
        opponent?.id ??
        `first-stand-${fallback.leagueLabel.toLowerCase()}-${index + 1}`,
      name: opponent?.name ?? fallback.name,
      leagueLabel: fallback.leagueLabel,
      group: fallback.group,
      seedLabel: fallback.seedLabel,
      sourceDetail: opponent ? "샘플 상대 데이터" : "임시 국제전 슬롯",
      strength: opponent?.strength ?? fallback.strength,
      isLck: false,
      isPlaceholder: !opponent,
    } satisfies FirstStandEntrant;
  });
}

export function getFirstStandEntrants(
  career: CareerSave,
  competition: CompetitionState,
) {
  return [
    ...createFirstStandLckEntrants(career, competition),
    ...createFirstStandInternationalEntrants(career),
  ].sort((left, right) => {
    if (left.group !== right.group) {
      return left.group.localeCompare(right.group);
    }

    return left.seedLabel.localeCompare(right.seedLabel);
  });
}

export function getFirstStandGroupEntrants(
  entrants: FirstStandEntrant[],
  group: FirstStandGroupId,
) {
  return entrants.filter((entrant) => entrant.group === group);
}

export function createFirstStandPreviewMatches(entrants: FirstStandEntrant[]) {
  const matches: FirstStandPreviewMatch[] = [];
  const groups: FirstStandGroupId[] = ["A", "B"];

  groups.forEach((group) => {
    const groupEntrants = getFirstStandGroupEntrants(entrants, group);

    groupEntrants.forEach((blue, blueIndex) => {
      groupEntrants.slice(blueIndex + 1).forEach((red) => {
        matches.push({
          id: `first-stand-group-${group}-${blue.id}-${red.id}`,
          dateLabel: `Group ${group} Day ${matches.length + 1}`,
          group,
          stageName: "Group Stage",
          blueTeamName: blue.name,
          redTeamName: red.name,
          formatLabel: "BO1",
        });
      });
    });
  });

  return matches;
}

export function getFallbackFirstStandGroupRows(
  entrants: FirstStandEntrant[],
  group: FirstStandGroupId,
): StandingEntry[] {
  return getFirstStandGroupEntrants(entrants, group).map((entrant, index) => ({
    teamId: entrant.id,
    teamName: entrant.name,
    rank: index + 1,
    initialSeed: index + 1,
    wins: 0,
    losses: 0,
    matchWins: 0,
    matchLosses: 0,
    setWins: 0,
    setLosses: 0,
    winRate: 0,
    isUserTeam: entrant.isLck && !entrant.isPlaceholder,
  }));
}
