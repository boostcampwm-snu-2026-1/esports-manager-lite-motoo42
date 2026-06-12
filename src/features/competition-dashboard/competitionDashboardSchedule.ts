import type { CompetitionState, MatchRecord, MatchSchedule } from "../../types/game";

export function getMatchRecord(
  match: MatchSchedule,
  records: MatchRecord[],
): MatchRecord | undefined {
  return records.find((record) => record.scheduleId === match.id);
}

export function getNextWeekMatches(competition: CompetitionState) {
  const nextMatch = [...competition.schedule]
    .filter((match) => match.status === "scheduled")
    .sort((left, right) => left.week - right.week)[0];

  if (!nextMatch) {
    return [];
  }

  return competition.schedule.filter(
    (match) =>
      match.status === "scheduled" &&
      match.week === nextMatch.week &&
      match.competitionId === competition.competitionId,
  );
}

export function getCurrentWeekMatches(competition: CompetitionState) {
  return competition.schedule.filter((match) => match.week === competition.currentWeek);
}

export function getRecentRecords(
  competition: CompetitionState,
  records: MatchRecord[],
) {
  return records
    .filter((record) => record.competitionId === competition.competitionId)
    .slice(-5)
    .reverse();
}

export function getNextUserMatch(
  competition: CompetitionState,
  userTeamId: string | undefined,
) {
  return [...competition.schedule]
    .filter(
      (match) =>
        match.status === "scheduled" &&
        (match.blueTeamId === userTeamId || match.redTeamId === userTeamId),
    )
    .sort((left, right) => {
      const dateDiff = (left.scheduledDate ?? "").localeCompare(
        right.scheduledDate ?? "",
      );

      return dateDiff !== 0 ? dateDiff : left.id.localeCompare(right.id);
    })[0];
}

export function getRecentUserRecord({
  competition,
  records,
  userTeamId,
}: {
  competition: CompetitionState;
  records: MatchRecord[];
  userTeamId: string | undefined;
}) {
  const scheduleById = new Map(competition.schedule.map((match) => [match.id, match]));

  return [...records]
    .filter((record) => record.competitionId === competition.competitionId)
    .reverse()
    .find((record) => {
      const match = scheduleById.get(record.scheduleId);

      return (
        match &&
        (match.blueTeamId === userTeamId || match.redTeamId === userTeamId)
      );
    });
}

export function getUserMatchResult({
  match,
  record,
  userTeamId,
}: {
  match: MatchSchedule;
  record: MatchRecord | undefined;
  userTeamId: string | undefined;
}) {
  if (
    !record ||
    !userTeamId ||
    (match.blueTeamId !== userTeamId && match.redTeamId !== userTeamId)
  ) {
    return "neutral";
  }

  const userScore =
    match.blueTeamId === userTeamId
      ? record.score.blueWins
      : record.score.redWins;
  const opponentScore =
    match.blueTeamId === userTeamId
      ? record.score.redWins
      : record.score.blueWins;

  return userScore > opponentScore ? "win" : "loss";
}

export function getScheduleStatusClass({
  match,
  record,
  userTeamId,
}: {
  match: MatchSchedule;
  record: MatchRecord | undefined;
  userTeamId: string | undefined;
}) {
  if (!record) {
    return "schedule-status-scheduled";
  }

  const userResult = getUserMatchResult({ match, record, userTeamId });

  if (userResult === "win") {
    return "schedule-status-user-win";
  }

  if (userResult === "loss") {
    return "schedule-status-user-loss";
  }

  return "schedule-status-neutral";
}

export function getRecordByScheduleId(records: MatchRecord[]) {
  return new Map(records.map((record) => [record.scheduleId, record]));
}

export function groupMatchesByDate(matches: MatchSchedule[]) {
  const groups = new Map<string, MatchSchedule[]>();

  matches.forEach((match) => {
    const dateKey = match.scheduledDate ?? "undated";
    const group = groups.get(dateKey) ?? [];

    group.push(match);
    groups.set(dateKey, group);
  });

  return [...groups.entries()]
    .sort(([leftDate], [rightDate]) => leftDate.localeCompare(rightDate))
    .map(([dateKey, groupedMatches]) => ({
      dateKey,
      matches: groupedMatches.sort((left, right) => left.id.localeCompare(right.id)),
    }));
}

export function getCompetitionScheduleGroups(competition: CompetitionState) {
  return [...competition.schedule]
    .sort((left, right) => {
      const dateDiff = (left.scheduledDate ?? "").localeCompare(
        right.scheduledDate ?? "",
      );

      return dateDiff !== 0 ? dateDiff : left.id.localeCompare(right.id);
    })
    .reduce<Array<{ dateKey: string; matches: MatchSchedule[] }>>((groups, match) => {
      const dateKey = match.scheduledDate ?? "날짜 미정";
      const existingGroup = groups.find((group) => group.dateKey === dateKey);

      if (existingGroup) {
        existingGroup.matches.push(match);
        return groups;
      }

      return [...groups, { dateKey, matches: [match] }];
    }, []);
}
