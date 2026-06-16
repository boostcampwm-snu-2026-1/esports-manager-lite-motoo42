import type {
  LckRoundsGroupName,
  MatchSchedule,
  SeasonCalendarType,
  StandingEntry,
} from "../../types/game";
import {
  assertLckSchedulePolicy,
  createFiveTeamLckWeekPairs,
  type LckFiveTeamWeekPair,
} from "./lckSchedulePolicy";
import { getDomesticMatchDateKey } from "./seasonScheduleDates";

export const lckRounds34RegularWeeks = 4;
export const lckRounds34MatchesPerTeam = 8;
export const lckRounds34TotalMatches = 40;
export const lckRounds34StageNames = {
  legend: "Legend Group",
  rise: "Rise Group",
} as const;
export const lckRounds34CurrentStageName = "Legend / Rise Groups";

type ScheduleOptions = {
  year: number;
  calendarType: SeasonCalendarType;
};

function sortByRank(standings: StandingEntry[]) {
  return [...standings].sort((left, right) => left.rank - right.rank);
}

function sortByInitialSeed(standings: StandingEntry[]) {
  return [...standings].sort((left, right) => left.initialSeed - right.initialSeed);
}

function createScheduleId({
  blueTeamId,
  group,
  redTeamId,
  roundNumber,
}: {
  blueTeamId: string;
  group: LckRoundsGroupName;
  redTeamId: string;
  roundNumber: number;
}) {
  return `lck-r34-${group}-round-${roundNumber}-${blueTeamId}-vs-${redTeamId}`
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");
}

function createMatch({
  dayIndex,
  group,
  match,
  options,
  roundNumber,
  week,
}: {
  dayIndex: number;
  group: LckRoundsGroupName;
  match: LckFiveTeamWeekPair;
  options: ScheduleOptions;
  roundNumber: number;
  week: number;
}): MatchSchedule {
  return {
    id: createScheduleId({
      blueTeamId: match.blue.teamId,
      group,
      redTeamId: match.red.teamId,
      roundNumber,
    }),
    competitionId: "lck-rounds-3-4",
    week,
    scheduledDate: getDomesticMatchDateKey({
      calendarType: options.calendarType,
      competitionId: "lck-rounds-3-4",
      matchIndexInWeek: dayIndex,
      week,
      year: options.year,
    }),
    stageName: lckRounds34StageNames[group],
    blueTeamId: match.blue.teamId,
    blueTeamName: match.blue.teamName,
    redTeamId: match.red.teamId,
    redTeamName: match.red.teamName,
    format: "bo3",
    status: "scheduled",
    fearlessEnabled: true,
  };
}

function createGroupSchedule({
  group,
  options,
  standings,
}: {
  group: LckRoundsGroupName;
  options: ScheduleOptions;
  standings: StandingEntry[];
}) {
  const seededStandings = sortByInitialSeed(standings);

  return Array.from({ length: lckRounds34RegularWeeks }, (_, index) => index + 1)
    .flatMap((week) =>
      createFiveTeamLckWeekPairs(seededStandings, week).map(({ dayIndex, item }) =>
        createMatch({
          dayIndex,
          group,
          match: item,
          options,
          roundNumber: (week - 1) * 5 + dayIndex + 1,
          week,
        }),
      ),
    );
}

function assignLckRounds34Group(
  entry: StandingEntry,
  index: number,
): StandingEntry {
  return {
    ...entry,
    rank: index + 1,
    initialSeed: index + 1,
    lckRoundsGroup: index < 5 ? "legend" : "rise",
  };
}

export function isLckRounds34RegularStageName(stageName: string) {
  return Object.values(lckRounds34StageNames).includes(
    stageName as (typeof lckRounds34StageNames)[keyof typeof lckRounds34StageNames],
  );
}

export function getLckRounds34GroupLabel(
  group: LckRoundsGroupName | undefined,
) {
  if (group === "legend") {
    return "Legend";
  }

  if (group === "rise") {
    return "Rise";
  }

  return "-";
}

export function createLckRounds34Setup(
  rounds12Standings: StandingEntry[],
  options: ScheduleOptions,
) {
  const standings = sortByRank(rounds12Standings).map(assignLckRounds34Group);
  const legendGroup = standings.filter((entry) => entry.lckRoundsGroup === "legend");
  const riseGroup = standings.filter((entry) => entry.lckRoundsGroup === "rise");
  const schedule = [
    ...createGroupSchedule({
      group: "legend",
      options,
      standings: legendGroup,
    }),
    ...createGroupSchedule({
      group: "rise",
      options,
      standings: riseGroup,
    }),
  ].sort((left, right) => {
    const dateDiff = (left.scheduledDate ?? "").localeCompare(
      right.scheduledDate ?? "",
    );

    return dateDiff !== 0 ? dateDiff : left.id.localeCompare(right.id);
  });

  assertLckSchedulePolicy(schedule);

  return {
    legendGroup,
    riseGroup,
    schedule,
    standings,
  };
}
