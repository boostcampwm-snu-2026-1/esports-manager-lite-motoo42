import type { MatchRecord, MatchSchedule, StandingEntry } from "../../types/game";

export function formatFirstStandDateLabel(dateKey: string | undefined) {
  if (!dateKey) {
    return "Date TBD";
  }

  const [year, month, day] = dateKey.split("-");

  return `${year}.${month}.${day}`;
}

export function getFirstStandSetDiffLabel(entry: StandingEntry) {
  const diff = entry.setWins - entry.setLosses;

  return `${diff > 0 ? "+" : ""}${diff}`;
}

export function isFirstStandUserMatch(
  match: MatchSchedule,
  userTeamId: string | undefined,
) {
  return match.blueTeamId === userTeamId || match.redTeamId === userTeamId;
}

export function getFirstStandMatchStatusLabel(
  match: MatchSchedule,
  record: MatchRecord | undefined,
) {
  if (!record) {
    return `${match.format.toUpperCase()} · Scheduled`;
  }

  return `${record.score.blueWins}-${record.score.redWins}`;
}
