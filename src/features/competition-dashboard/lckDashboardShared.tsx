import type { CompetitionState, MatchRecord, MatchSchedule } from "../../types/game";
import { getDateLabel, getFormatLabel } from "./competitionDashboardShared";

export type LckPlayoffSlot = {
  label: string;
  teamId?: string;
  teamName: string;
  detail: string;
  isPlaceholder: boolean;
  isWinner?: boolean;
  score?: number;
};

export type LckPlayoffMatch = {
  id: string;
  stageName: string;
  title: string;
  subtitle: string;
  slots: LckPlayoffSlot[];
};

export function createWinnerSlot(label: string): LckPlayoffSlot {
  return {
    label,
    teamName: label,
    detail: "이전 라운드 승자",
    isPlaceholder: true,
  };
}

export function getPlayoffMatch(
  competition: CompetitionState,
  scheduleId: string,
): MatchSchedule | undefined {
  return competition.schedule.find((match) => match.id === scheduleId);
}

export function createSlotFromMatchSide({
  label,
  match,
  record,
  side,
}: {
  label: string;
  match: MatchSchedule | undefined;
  record: MatchRecord | undefined;
  side: "blue" | "red";
}): LckPlayoffSlot {
  if (!match) {
    return createWinnerSlot(label);
  }

  const teamId = side === "blue" ? match.blueTeamId : match.redTeamId;
  const teamName = side === "blue" ? match.blueTeamName : match.redTeamName;
  const score = record
    ? side === "blue"
      ? record.score.blueWins
      : record.score.redWins
    : undefined;
  const isWinner = record?.winnerTeamId === teamId;

  return {
    label,
    teamId,
    teamName,
    detail: record
      ? `${score}-${side === "blue" ? record.score.redWins : record.score.blueWins} ${
          isWinner ? "승리" : "패배"
        }`
      : `${getDateLabel(match.scheduledDate)} · ${getFormatLabel(match)}`,
    isPlaceholder: false,
    isWinner,
    score,
  };
}

export function LckPlayoffTeamSlot({
  slot,
  userTeamId,
}: {
  slot: LckPlayoffSlot;
  userTeamId: string | undefined;
}) {
  const classes = [
    "lck-playoff-team",
    slot.isPlaceholder ? "lck-playoff-team-placeholder" : "",
    slot.teamId === userTeamId ? "lck-playoff-team-user" : "",
    slot.isWinner ? "lck-playoff-team-winner" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <span>{slot.label}</span>
      <strong>{slot.teamName}</strong>
      <small>{slot.detail}</small>
    </div>
  );
}

export function LckPlayoffMatchCard({
  isCurrent,
  match,
  userTeamId,
}: {
  isCurrent: boolean;
  match: LckPlayoffMatch;
  userTeamId: string | undefined;
}) {
  return (
    <article
      className={`lck-playoff-match ${
        isCurrent ? "lck-playoff-match-current" : ""
      }`}
    >
      <header>
        <strong>{match.title}</strong>
        <span>{isCurrent ? `현재 라운드 · ${match.subtitle}` : match.subtitle}</span>
      </header>
      <div className="lck-playoff-match-slots">
        {match.slots.map((slot) => (
          <LckPlayoffTeamSlot
            key={`${match.id}-${slot.label}`}
            slot={slot}
            userTeamId={userTeamId}
          />
        ))}
      </div>
    </article>
  );
}
