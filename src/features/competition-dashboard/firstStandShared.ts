import { firstStandStageNames } from "../../domain/season";
import type { MatchRecord, MatchSchedule, StandingEntry } from "../../types/game";

export function formatFirstStandDateLabel(dateKey: string | undefined) {
  if (!dateKey) {
    return "날짜 미정";
  }

  const [year, month, day] = dateKey.split("-");

  return `${year}.${month}.${day}`;
}

export function getFirstStandSetDiffLabel(entry: StandingEntry) {
  const diff = entry.setWins - entry.setLosses;

  return `${diff > 0 ? "+" : ""}${diff}`;
}

export function getFirstStandStageLabel(stageName: string) {
  const labels: Record<string, string> = {
    [firstStandStageNames.groupA]: "A조",
    [firstStandStageNames.groupB]: "B조",
    [firstStandStageNames.semifinals]: "준결승",
    [firstStandStageNames.final]: "결승",
    "Group Stage": "조별리그",
    Completed: "완료",
  };

  return labels[stageName] ?? stageName;
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
    return `${match.format.toUpperCase()} · 예정`;
  }

  return `${record.score.blueWins}-${record.score.redWins}`;
}
