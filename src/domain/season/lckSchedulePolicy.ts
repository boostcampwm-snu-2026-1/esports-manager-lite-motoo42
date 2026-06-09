import type { MatchSchedule, StandingEntry } from "../../types/game";
import {
  dateKeyToDate,
  getDateWeekday,
} from "./seasonScheduleDates";

export const lckMatchDayIndexes = [0, 1, 2, 3, 4] as const;
const lckAllowedWeekdays = new Set([0, 3, 4, 5, 6]);
const lckMaxMatchesPerDate = 2;
const lckMinimumRestDays = 2;

type TeamPair = {
  blueTeamId: string;
  redTeamId: string;
};

type WeekSlotAssignment<T> = {
  dayIndex: number;
  item: T;
};

export type LckFiveTeamWeekPair = {
  blue: StandingEntry;
  red: StandingEntry;
  blueTeamId: string;
  redTeamId: string;
};

function getDateDiffInDays(leftDateKey: string, rightDateKey: string) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.round(
    Math.abs(
      dateKeyToDate(leftDateKey).getTime() - dateKeyToDate(rightDateKey).getTime(),
    ) / millisecondsPerDay,
  );
}

function getTeamIds(pair: TeamPair) {
  return [pair.blueTeamId, pair.redTeamId];
}

export function assignMatchesToLckWeekSlots<T extends TeamPair>(
  matches: T[],
): WeekSlotAssignment<T>[] {
  const dayCounts = new Map<number, number>();
  const teamDays = new Map<string, number[]>();
  const assignments: WeekSlotAssignment<T>[] = [];

  function canPlace(match: T, dayIndex: number) {
    if ((dayCounts.get(dayIndex) ?? 0) >= lckMaxMatchesPerDate) {
      return false;
    }

    return getTeamIds(match).every((teamId) =>
      (teamDays.get(teamId) ?? []).every(
        (usedDayIndex) => Math.abs(usedDayIndex - dayIndex) >= lckMinimumRestDays,
      ),
    );
  }

  function place(match: T, dayIndex: number) {
    dayCounts.set(dayIndex, (dayCounts.get(dayIndex) ?? 0) + 1);
    getTeamIds(match).forEach((teamId) => {
      teamDays.set(teamId, [...(teamDays.get(teamId) ?? []), dayIndex]);
    });
    assignments.push({ dayIndex, item: match });
  }

  function remove(match: T, dayIndex: number) {
    dayCounts.set(dayIndex, (dayCounts.get(dayIndex) ?? 1) - 1);
    getTeamIds(match).forEach((teamId) => {
      teamDays.set(
        teamId,
        (teamDays.get(teamId) ?? []).filter(
          (usedDayIndex) => usedDayIndex !== dayIndex,
        ),
      );
    });
    assignments.pop();
  }

  function search(matchIndex: number): boolean {
    if (matchIndex >= matches.length) {
      return true;
    }

    const match = matches[matchIndex];

    for (const dayIndex of lckMatchDayIndexes) {
      if (!canPlace(match, dayIndex)) {
        continue;
      }

      place(match, dayIndex);

      if (search(matchIndex + 1)) {
        return true;
      }

      remove(match, dayIndex);
    }

    return false;
  }

  if (!search(0)) {
    throw new Error("Unable to place LCK matches into weekly broadcast slots.");
  }

  return [...assignments].sort((left, right) => {
    const dayDiff = left.dayIndex - right.dayIndex;

    return dayDiff !== 0 ? dayDiff : matches.indexOf(left.item) - matches.indexOf(right.item);
  });
}

function createFiveTeamPair(
  left: StandingEntry,
  right: StandingEntry,
  reverseSides: boolean,
): LckFiveTeamWeekPair {
  const blue = reverseSides ? right : left;
  const red = reverseSides ? left : right;

  return {
    blue,
    red,
    blueTeamId: blue.teamId,
    redTeamId: red.teamId,
  };
}

export function createFiveTeamLckWeekPairs(
  standings: StandingEntry[],
  week: number,
) {
  if (standings.length !== 5) {
    throw new Error("LCK grouped round schedule requires exactly five teams.");
  }

  const [a, b, c, d, e] =
    week % 2 === 1
      ? standings
      : [standings[0], standings[2], standings[4], standings[1], standings[3]];
  const reverseSides = Math.floor((week - 1) / 2) % 2 === 1;

  return [
    createFiveTeamPair(a, b, reverseSides),
    createFiveTeamPair(c, d, reverseSides),
    createFiveTeamPair(e, a, reverseSides),
    createFiveTeamPair(c, b, reverseSides),
    createFiveTeamPair(e, d, reverseSides),
  ].map((pair, dayIndex) => ({
    dayIndex,
    item: pair,
  }));
}

export function getLckSchedulePolicyIssues(
  schedule: MatchSchedule[],
  options: {
    maxMatchesPerDate?: number;
    minRestDays?: number;
  } = {},
) {
  const maxMatchesPerDate = options.maxMatchesPerDate ?? lckMaxMatchesPerDate;
  const minRestDays = options.minRestDays ?? lckMinimumRestDays;
  const issues: string[] = [];
  const dateCounts = new Map<string, number>();
  const teamDateKeys = new Map<string, string[]>();

  schedule.forEach((match) => {
    if (!match.scheduledDate) {
      issues.push(`${match.id} has no scheduled date.`);
      return;
    }

    const weekday = getDateWeekday(match.scheduledDate);

    if (!lckAllowedWeekdays.has(weekday)) {
      issues.push(`${match.id} is not scheduled from Wednesday to Sunday.`);
    }

    dateCounts.set(match.scheduledDate, (dateCounts.get(match.scheduledDate) ?? 0) + 1);

    [match.blueTeamId, match.redTeamId].forEach((teamId) => {
      teamDateKeys.set(teamId, [...(teamDateKeys.get(teamId) ?? []), match.scheduledDate!]);
    });
  });

  dateCounts.forEach((count, dateKey) => {
    if (count > maxMatchesPerDate) {
      issues.push(`${dateKey} has ${count} matches.`);
    }
  });

  teamDateKeys.forEach((dateKeys, teamId) => {
    const sortedDateKeys = [...dateKeys].sort();

    sortedDateKeys.slice(1).forEach((dateKey, index) => {
      const previousDateKey = sortedDateKeys[index];
      const dateDiff = getDateDiffInDays(previousDateKey, dateKey);

      if (dateDiff < minRestDays) {
        issues.push(`${teamId} plays with only ${dateDiff} day(s) of rest.`);
      }
    });
  });

  return issues;
}

export function assertLckSchedulePolicy(
  schedule: MatchSchedule[],
  options: {
    maxMatchesPerDate?: number;
    minRestDays?: number;
  } = {},
) {
  const issues = getLckSchedulePolicyIssues(schedule, options);

  if (issues.length > 0) {
    throw new Error(`Invalid LCK schedule: ${issues.join(" ")}`);
  }
}
