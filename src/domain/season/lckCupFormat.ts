import type {
  CompetitionState,
  LckCupGroupName,
  MatchRecord,
  MatchSchedule,
  SeasonCalendarType,
  StandingEntry,
} from "../../types/game";
import {
  assertLckSchedulePolicy,
  assignMatchesToLckWeekSlots,
} from "./lckSchedulePolicy";
import { getDomesticMatchDateKey } from "./seasonScheduleDates";

export const lckCupGroupBattleWeeks = 3;
export const lckCupPlayInRound1Week = lckCupGroupBattleWeeks + 1;
export const lckCupPlayInRound2Week = lckCupGroupBattleWeeks + 2;
export const lckCupPlayoffsWildcardWeek = lckCupGroupBattleWeeks + 3;
export const lckCupPlayoffsSemifinalsWeek = lckCupGroupBattleWeeks + 4;
export const lckCupFinalsWeek = lckCupGroupBattleWeeks + 5;

const baronSeedIndexes = new Set([0, 3, 4, 7, 8]);

const lckCupStageNames = {
  groupBattle: "Group Battle",
  superWeek: "Group Battle Super Week",
  playInRound1: "Play-In Round 1",
  playInRound2: "Play-In Round 2",
  playoffsWildcard: "Playoffs Wildcard",
  playoffsSemifinals: "Playoffs Semifinals",
  finals: "Finals",
} as const;

type SeededTeam = StandingEntry & {
  lckCupGroup: LckCupGroupName;
};

type ScheduleDateOptions = {
  year: number;
  calendarType: SeasonCalendarType;
};

type LckCupCrossGroupPair = {
  blue: StandingEntry;
  red: StandingEntry;
  blueTeamId: string;
  redTeamId: string;
};

function getGroupLabel(group: LckCupGroupName) {
  return group === "baron" ? "Baron" : "Elder";
}

function getTeamById(standings: StandingEntry[], teamId: string) {
  const team = standings.find((entry) => entry.teamId === teamId);

  if (!team) {
    throw new Error(`Unknown LCK team: ${teamId}`);
  }

  return team;
}

function createScheduleId(
  stage: string,
  week: number,
  blueTeamId: string,
  redTeamId: string,
) {
  return `lck-cup-week-${week}-${stage}-${blueTeamId}-vs-${redTeamId}`
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");
}

function createMatch({
  scheduledDate,
  week,
  stageName,
  blue,
  red,
  format,
}: {
  scheduledDate?: string;
  week: number;
  stageName: string;
  blue: StandingEntry;
  red: StandingEntry;
  format: MatchSchedule["format"];
}): MatchSchedule {
  return {
    id: createScheduleId(stageName, week, blue.teamId, red.teamId),
    competitionId: "lck-cup",
    week,
    scheduledDate,
    stageName,
    blueTeamId: blue.teamId,
    blueTeamName: blue.teamName,
    redTeamId: red.teamId,
    redTeamName: red.teamName,
    format,
    status: "scheduled",
    fearlessEnabled: true,
  };
}

function getLckCupScheduledDate(
  options: ScheduleDateOptions | undefined,
  week: number,
  matchIndexInWeek: number,
) {
  return options
    ? getDomesticMatchDateKey({
        calendarType: options.calendarType,
        competitionId: "lck-cup",
        matchIndexInWeek,
        week,
        year: options.year,
      })
    : undefined;
}

function getLckCupWeekDate(
  options: ScheduleDateOptions | undefined,
  week: number,
  dayIndex: number,
) {
  return options ? getLckCupScheduledDate(options, week, dayIndex) : undefined;
}

function sortByInitialSeed(standings: StandingEntry[]) {
  return [...standings].sort((left, right) => left.initialSeed - right.initialSeed);
}

function isGroupBattleMatch(match: MatchSchedule) {
  return (
    match.stageName === lckCupStageNames.groupBattle ||
    match.stageName === lckCupStageNames.superWeek
  );
}

function sortStandingsForSeed(standings: StandingEntry[]) {
  return [...standings].sort((left, right) => {
    const winDiff = right.wins - left.wins;

    if (winDiff !== 0) {
      return winDiff;
    }

    const leftSetDiff = left.setWins - left.setLosses;
    const rightSetDiff = right.setWins - right.setLosses;
    const setDiff = rightSetDiff - leftSetDiff;

    if (setDiff !== 0) {
      return setDiff;
    }

    return left.initialSeed - right.initialSeed;
  });
}

function updateEntryWithRecord(
  entry: StandingEntry,
  record: MatchRecord,
  side: "blue" | "red",
) {
  const setWins = side === "blue" ? record.score.blueWins : record.score.redWins;
  const setLosses = side === "blue" ? record.score.redWins : record.score.blueWins;
  const wonMatch = record.winnerSide === side;
  const wins = entry.wins + (wonMatch ? 1 : 0);
  const losses = entry.losses + (wonMatch ? 0 : 1);
  const totalMatches = wins + losses;

  return {
    ...entry,
    wins,
    losses,
    matchWins: wins,
    matchLosses: losses,
    setWins: entry.setWins + setWins,
    setLosses: entry.setLosses + setLosses,
    winRate: totalMatches > 0 ? wins / totalMatches : 0,
  };
}

function calculateTableFromRecords({
  standings,
  schedule,
  records,
}: {
  standings: StandingEntry[];
  schedule: MatchSchedule[];
  records: MatchRecord[];
}) {
  const scheduleById = new Map(schedule.map((match) => [match.id, match]));
  const baseStandings = standings.map((entry) => ({
    ...entry,
    wins: 0,
    losses: 0,
    matchWins: 0,
    matchLosses: 0,
    setWins: 0,
    setLosses: 0,
    winRate: 0,
  }));

  return records.reduce<StandingEntry[]>((currentStandings, record) => {
    const match = scheduleById.get(record.scheduleId);

    if (!match) {
      return currentStandings;
    }

    return currentStandings.map((entry) => {
      if (entry.teamId === match.blueTeamId) {
        return updateEntryWithRecord(entry, record, "blue");
      }

      if (entry.teamId === match.redTeamId) {
        return updateEntryWithRecord(entry, record, "red");
      }

      return entry;
    });
  }, baseStandings);
}

function getCompletedRecords(
  competition: CompetitionState,
  records: MatchRecord[],
  stageName?: string,
) {
  const completedScheduleIds = new Set(
    competition.schedule
      .filter((match) => match.status === "completed")
      .filter((match) => !stageName || match.stageName === stageName)
      .map((match) => match.id),
  );

  return records.filter((record) => completedScheduleIds.has(record.scheduleId));
}

function getStageWinners(
  competition: CompetitionState,
  records: MatchRecord[],
  stageName: string,
) {
  return getCompletedRecords(competition, records, stageName).map((record) =>
    getTeamById(competition.standings, record.winnerTeamId),
  );
}

function createPlaceholderStanding(entry: StandingEntry): SeededTeam {
  return {
    ...entry,
    lckCupGroup: entry.lckCupGroup ?? "baron",
  };
}

function createCrossGroupPair({
  baronTeam,
  elderTeam,
  shouldSwapSide,
}: {
  baronTeam: StandingEntry;
  elderTeam: StandingEntry;
  shouldSwapSide: boolean;
}): LckCupCrossGroupPair {
  const blue = shouldSwapSide ? elderTeam : baronTeam;
  const red = shouldSwapSide ? baronTeam : elderTeam;

  return {
    blue,
    red,
    blueTeamId: blue.teamId,
    redTeamId: red.teamId,
  };
}

function createRegularGroupBattleWeekPairs({
  baronTeams,
  elderTeams,
  week,
}: {
  baronTeams: StandingEntry[];
  elderTeams: StandingEntry[];
  week: number;
}) {
  const shiftsByWeek = week === 1 ? [1, 2] : [3, 4];

  return shiftsByWeek.flatMap((shift) =>
    baronTeams.map((baronTeam, index) =>
      createCrossGroupPair({
        baronTeam,
        elderTeam: elderTeams[(index + shift) % elderTeams.length],
        shouldSwapSide: (week + shift + index) % 2 === 0,
      }),
    ),
  );
}

function createRegularGroupBattleSchedule({
  baronTeams,
  elderTeams,
  options,
}: {
  baronTeams: StandingEntry[];
  elderTeams: StandingEntry[];
  options?: ScheduleDateOptions;
}) {
  return [1, 2].flatMap((week) =>
    assignMatchesToLckWeekSlots(
      createRegularGroupBattleWeekPairs({
        baronTeams,
        elderTeams,
        week,
      }),
    ).map(({ dayIndex, item }) =>
      createMatch({
        scheduledDate: getLckCupWeekDate(options, week, dayIndex),
        week,
        stageName: lckCupStageNames.groupBattle,
        blue: item.blue,
        red: item.red,
        format: "bo3",
      }),
    ),
  );
}

function createSuperWeekSchedule({
  baronTeams,
  elderTeams,
  options,
}: {
  baronTeams: StandingEntry[];
  elderTeams: StandingEntry[];
  options?: ScheduleDateOptions;
}) {
  return [4, 3, 2, 1, 0].map((selectionIndex, dayIndex) => {
    const shouldSwapSide = dayIndex % 2 === 1;
    const pair = createCrossGroupPair({
      baronTeam: baronTeams[selectionIndex],
      elderTeam: elderTeams[selectionIndex],
      shouldSwapSide,
    });

    return createMatch({
      scheduledDate: getLckCupWeekDate(options, lckCupGroupBattleWeeks, dayIndex),
      week: lckCupGroupBattleWeeks,
      stageName: lckCupStageNames.superWeek,
      blue: pair.blue,
      red: pair.red,
      format: "bo5",
    });
  });
}

export function assignLckCupGroups(standings: StandingEntry[]): StandingEntry[] {
  const seededStandings = sortByInitialSeed(standings);
  const groupByTeamId = new Map<string, LckCupGroupName>();

  seededStandings.forEach((entry, index) => {
    groupByTeamId.set(entry.teamId, baronSeedIndexes.has(index) ? "baron" : "elder");
  });

  return standings.map((entry) => ({
    ...entry,
    lckCupGroup: groupByTeamId.get(entry.teamId) ?? "baron",
  }));
}

export function createLckCupSchedule(
  standings: StandingEntry[],
  options?: ScheduleDateOptions,
): {
  standings: StandingEntry[];
  schedule: MatchSchedule[];
} {
  const groupedStandings = assignLckCupGroups(standings);
  const baronTeams = sortByInitialSeed(
    groupedStandings.filter((entry) => entry.lckCupGroup === "baron"),
  );
  const elderTeams = sortByInitialSeed(
    groupedStandings.filter((entry) => entry.lckCupGroup === "elder"),
  );
  const schedule = [
    ...createRegularGroupBattleSchedule({
      baronTeams,
      elderTeams,
      options,
    }),
    ...createSuperWeekSchedule({
      baronTeams,
      elderTeams,
      options,
    }),
  ];

  assertLckSchedulePolicy(schedule);

  return { standings: groupedStandings, schedule };
}

export function getLckCupGroupBattleTable(
  competition: CompetitionState,
  records: MatchRecord[],
) {
  const groupBattleSchedule = competition.schedule.filter(isGroupBattleMatch);
  const groupBattleScheduleIds = new Set(
    groupBattleSchedule.map((match) => match.id),
  );
  const groupBattleRecords = records.filter((record) =>
    groupBattleScheduleIds.has(record.scheduleId),
  );

  const table = calculateTableFromRecords({
    standings: competition.standings,
    schedule: groupBattleSchedule,
    records: groupBattleRecords,
  });

  return sortStandingsForSeed(table);
}

export function getLckCupGroupPointSummary(
  competition: CompetitionState,
  records: MatchRecord[],
) {
  const groupBattleSchedule = competition.schedule.filter(isGroupBattleMatch);
  const scheduleById = new Map(groupBattleSchedule.map((match) => [match.id, match]));
  const groups: Record<LckCupGroupName, { points: number; setDiff: number; topSeed: number }> = {
    baron: { points: 0, setDiff: 0, topSeed: Number.MAX_SAFE_INTEGER },
    elder: { points: 0, setDiff: 0, topSeed: Number.MAX_SAFE_INTEGER },
  };

  competition.standings.forEach((entry) => {
    if (entry.lckCupGroup) {
      groups[entry.lckCupGroup].topSeed = Math.min(
        groups[entry.lckCupGroup].topSeed,
        entry.initialSeed,
      );
    }
  });

  records.forEach((record) => {
    const match = scheduleById.get(record.scheduleId);

    if (!match) {
      return;
    }

    const winner = getTeamById(competition.standings, record.winnerTeamId);
    const winnerGroup = winner.lckCupGroup ?? "baron";
    const pointValue = match.format === "bo5" ? 2 : 1;

    groups[winnerGroup].points += pointValue;
    groups.baron.setDiff +=
      (winnerGroup === "baron" ? 1 : -1) *
      Math.abs(record.score.blueWins - record.score.redWins);
    groups.elder.setDiff = -groups.baron.setDiff;
  });

  const winnerGroup: LckCupGroupName =
    groups.baron.points > groups.elder.points
      ? "baron"
      : groups.elder.points > groups.baron.points
        ? "elder"
        : groups.baron.setDiff > groups.elder.setDiff
          ? "baron"
          : groups.elder.setDiff > groups.baron.setDiff
            ? "elder"
            : groups.baron.topSeed < groups.elder.topSeed
              ? "baron"
              : "elder";

  return {
    groups,
    winnerGroup,
    loserGroup: winnerGroup === "baron" ? "elder" : "baron",
  };
}

export function getLckCupAdvancement(
  competition: CompetitionState,
  records: MatchRecord[],
) {
  const groupTable = getLckCupGroupBattleTable(competition, records);
  const { winnerGroup, loserGroup } = getLckCupGroupPointSummary(
    competition,
    records,
  );
  const winnerGroupTeams = sortStandingsForSeed(
    groupTable.filter((entry) => entry.lckCupGroup === winnerGroup),
  );
  const loserGroupTeams = sortStandingsForSeed(
    groupTable.filter((entry) => entry.lckCupGroup === loserGroup),
  );
  const directPlayoffTeams = [
    ...winnerGroupTeams.slice(0, 2),
    ...loserGroupTeams.slice(0, 1),
  ];
  const playInTeams = sortStandingsForSeed([
    ...winnerGroupTeams.slice(2, 5),
    ...loserGroupTeams.slice(1, 4),
  ]);
  const eliminatedTeam = loserGroupTeams[4];

  return {
    winnerGroup,
    loserGroup,
    directPlayoffTeams,
    playInTeams,
    eliminatedTeam,
  };
}

export function createLckCupPlayInRound1Schedule(
  competition: CompetitionState,
  records: MatchRecord[],
  options?: ScheduleDateOptions,
): MatchSchedule[] {
  const { playInTeams } = getLckCupAdvancement(competition, records);
  const seeded = playInTeams.map(createPlaceholderStanding);

  return [
    createMatch({
      scheduledDate: getLckCupScheduledDate(options, lckCupPlayInRound1Week, 0),
      week: lckCupPlayInRound1Week,
      stageName: lckCupStageNames.playInRound1,
      blue: seeded[2],
      red: seeded[5],
      format: "bo3",
    }),
    createMatch({
      scheduledDate: getLckCupScheduledDate(options, lckCupPlayInRound1Week, 1),
      week: lckCupPlayInRound1Week,
      stageName: lckCupStageNames.playInRound1,
      blue: seeded[3],
      red: seeded[4],
      format: "bo3",
    }),
  ];
}

export function createLckCupPlayInRound2Schedule(
  competition: CompetitionState,
  records: MatchRecord[],
  options?: ScheduleDateOptions,
): MatchSchedule[] {
  const { playInTeams } = getLckCupAdvancement(competition, records);
  const seeded = playInTeams.map(createPlaceholderStanding);
  const round1Winners = getStageWinners(
    competition,
    records,
    lckCupStageNames.playInRound1,
  );
  const winnerFromSeed3v6 = round1Winners.find((winner) =>
    [seeded[2].teamId, seeded[5].teamId].includes(winner.teamId),
  );
  const winnerFromSeed4v5 = round1Winners.find((winner) =>
    [seeded[3].teamId, seeded[4].teamId].includes(winner.teamId),
  );

  if (!winnerFromSeed3v6 || !winnerFromSeed4v5) {
    return [];
  }

  return [
    createMatch({
      scheduledDate: getLckCupScheduledDate(options, lckCupPlayInRound2Week, 0),
      week: lckCupPlayInRound2Week,
      stageName: lckCupStageNames.playInRound2,
      blue: seeded[0],
      red: winnerFromSeed4v5,
      format: "bo3",
    }),
    createMatch({
      scheduledDate: getLckCupScheduledDate(options, lckCupPlayInRound2Week, 1),
      week: lckCupPlayInRound2Week,
      stageName: lckCupStageNames.playInRound2,
      blue: seeded[1],
      red: winnerFromSeed3v6,
      format: "bo3",
    }),
  ];
}

export function createLckCupPlayoffsWildcardSchedule(
  competition: CompetitionState,
  records: MatchRecord[],
  options?: ScheduleDateOptions,
): MatchSchedule[] {
  const playInWinners = getStageWinners(
    competition,
    records,
    lckCupStageNames.playInRound2,
  ).map(createPlaceholderStanding);

  if (playInWinners.length < 2) {
    return [];
  }

  return [
    createMatch({
      scheduledDate: getLckCupScheduledDate(options, lckCupPlayoffsWildcardWeek, 0),
      week: lckCupPlayoffsWildcardWeek,
      stageName: lckCupStageNames.playoffsWildcard,
      blue: playInWinners[0],
      red: playInWinners[1],
      format: "bo5",
    }),
  ];
}

export function createLckCupPlayoffsSemifinalSchedule(
  competition: CompetitionState,
  records: MatchRecord[],
  options?: ScheduleDateOptions,
): MatchSchedule[] {
  const { directPlayoffTeams } = getLckCupAdvancement(competition, records);
  const direct = directPlayoffTeams.map(createPlaceholderStanding);
  const wildcardWinner = getStageWinners(
    competition,
    records,
    lckCupStageNames.playoffsWildcard,
  )[0];

  if (!wildcardWinner) {
    return [];
  }

  return [
    createMatch({
      scheduledDate: getLckCupScheduledDate(options, lckCupPlayoffsSemifinalsWeek, 0),
      week: lckCupPlayoffsSemifinalsWeek,
      stageName: lckCupStageNames.playoffsSemifinals,
      blue: direct[0],
      red: wildcardWinner,
      format: "bo5",
    }),
    createMatch({
      scheduledDate: getLckCupScheduledDate(options, lckCupPlayoffsSemifinalsWeek, 1),
      week: lckCupPlayoffsSemifinalsWeek,
      stageName: lckCupStageNames.playoffsSemifinals,
      blue: direct[1],
      red: direct[2],
      format: "bo5",
    }),
  ];
}

export function createLckCupFinalsSchedule(
  competition: CompetitionState,
  records: MatchRecord[],
  options?: ScheduleDateOptions,
): MatchSchedule[] {
  const semifinalWinners = getStageWinners(
    competition,
    records,
    lckCupStageNames.playoffsSemifinals,
  ).map(createPlaceholderStanding);

  if (semifinalWinners.length < 2) {
    return [];
  }

  return [
    createMatch({
      scheduledDate: getLckCupScheduledDate(options, lckCupFinalsWeek, 0),
      week: lckCupFinalsWeek,
      stageName: lckCupStageNames.finals,
      blue: semifinalWinners[0],
      red: semifinalWinners[1],
      format: "bo5",
    }),
  ];
}

export function getNextLckCupKnockoutSchedule(
  competition: CompetitionState,
  records: MatchRecord[],
  completedWeek: number,
  options?: ScheduleDateOptions,
): MatchSchedule[] {
  if (completedWeek === lckCupGroupBattleWeeks) {
    return createLckCupPlayInRound1Schedule(competition, records, options);
  }

  if (completedWeek === lckCupPlayInRound1Week) {
    return createLckCupPlayInRound2Schedule(competition, records, options);
  }

  if (completedWeek === lckCupPlayInRound2Week) {
    return createLckCupPlayoffsWildcardSchedule(competition, records, options);
  }

  if (completedWeek === lckCupPlayoffsWildcardWeek) {
    return createLckCupPlayoffsSemifinalSchedule(competition, records, options);
  }

  if (completedWeek === lckCupPlayoffsSemifinalsWeek) {
    return createLckCupFinalsSchedule(competition, records, options);
  }

  return [];
}

export function getLckCupFinalists(
  competition: CompetitionState,
  records: MatchRecord[],
) {
  const finalsMatch = competition.schedule.find(
    (match) => match.stageName === lckCupStageNames.finals,
  );
  const finalsRecord = finalsMatch
    ? records.find((record) => record.scheduleId === finalsMatch.id)
    : undefined;

  if (!finalsMatch || !finalsRecord) {
    return [];
  }

  return [
    getTeamById(competition.standings, finalsMatch.blueTeamId),
    getTeamById(competition.standings, finalsMatch.redTeamId),
  ];
}

export function getLckCupStageNames() {
  return lckCupStageNames;
}
