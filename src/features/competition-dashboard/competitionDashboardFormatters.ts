import { getLckTeamDisplayName } from "../../data/lckTeams";
import type {
  CompetitionState,
  LckCupGroupName,
  MatchRecord,
  MatchSchedule,
  StandingEntry,
  WorldsQualificationState,
} from "../../types/game";

export function getGroupLabel(group: LckCupGroupName | undefined) {
  if (!group) {
    return "-";
  }

  return group === "baron" ? "Baron" : "Elder";
}

export function getSetDiff(entry: StandingEntry) {
  const diff = entry.setWins - entry.setLosses;

  return `${diff > 0 ? "+" : ""}${diff}`;
}

export function getMatchCount(entry: StandingEntry) {
  return entry.wins + entry.losses;
}

export function getDateLabel(dateKey: string | undefined) {
  if (!dateKey) {
    return "날짜 미정";
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];

  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")} (${weekdayLabels[date.getDay()]})`;
}

export function getScoreLabel(record: MatchRecord | undefined) {
  if (!record) {
    return "예정";
  }

  return `${record.score.blueWins}-${record.score.redWins}`;
}

export function getMatchTitle(match: MatchSchedule) {
  return `${getLckTeamDisplayName(match.blueTeamName)} vs ${getLckTeamDisplayName(
    match.redTeamName,
  )}`;
}

export function getFormatLabel(match: MatchSchedule) {
  return `${match.format.toUpperCase()}${match.fearlessEnabled ? " · Fearless" : ""}`;
}

export function getSelectionStarsFromForm(form: number) {
  return Math.max(0.5, Math.min(5, Math.round(form / 10) * 0.5));
}

export function getUserResultLabel(record: MatchRecord | undefined) {
  if (!record) {
    return "결과 없음";
  }

  if (record.userResult === "win") {
    return "승리";
  }

  if (record.userResult === "loss") {
    return "패배";
  }

  return "중립";
}

export function findTeamNameInCompetition(
  competition: CompetitionState | undefined,
  teamId: string | undefined,
) {
  if (!competition || !teamId) {
    return undefined;
  }

  return competition.standings.find((entry) => entry.teamId === teamId)?.teamName;
}

export function getStatusText(competition: CompetitionState) {
  if (competition.completed) {
    return "Completed";
  }

  if (competition.status === "active") {
    return competition.currentStageName;
  }

  return competition.status;
}

export function isLckRounds34Competition(competition: CompetitionState) {
  return competition.competitionId === "lck-rounds-3-4";
}

export function isLckRounds35Competition(competition: CompetitionState) {
  return competition.competitionId === "lck-rounds-3-5";
}

export function isLateLckRoundsCompetition(competition: CompetitionState) {
  return isLckRounds34Competition(competition) || isLckRounds35Competition(competition);
}

export function isLckRoundsDashboardCompetition(competition: CompetitionState) {
  return (
    competition.competitionId === "lck-rounds-1-2" ||
    isLateLckRoundsCompetition(competition)
  );
}

export function getLckRoundsFormatTitle(competition: CompetitionState) {
  if (isLckRounds34Competition(competition)) {
    return "LCK Rounds 3-4";
  }

  if (isLckRounds35Competition(competition)) {
    return "LCK Rounds 3-5";
  }

  return "LCK Rounds 1-2";
}

export function formatWorldsBonusLeagueLabel(
  qualification: WorldsQualificationState | undefined,
) {
  return qualification?.bonusLeagueLabels.length
    ? qualification.bonusLeagueLabels.join(" / ")
    : "판정 대기";
}
