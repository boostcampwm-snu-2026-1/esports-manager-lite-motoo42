import {
  firstStandMatchIds,
  firstStandStageNames,
  getFirstStandFinalists,
} from "../../domain/season";
import type { CompetitionState, MatchRecord, MatchSchedule } from "../../types/game";
import {
  getFormatLabel,
  getRecordByScheduleId,
} from "./competitionDashboardShared";
import {
  formatFirstStandDateLabel,
  getFirstStandMatchStatusLabel,
} from "./firstStandShared";

function getFirstStandBracketMatch(
  competition: CompetitionState,
  scheduleId: string,
) {
  return competition.schedule.find((match) => match.id === scheduleId);
}

function FirstStandBracketTeam({
  label,
  match,
  record,
  side,
  userTeamId,
}: {
  label: string;
  match: MatchSchedule | undefined;
  record: MatchRecord | undefined;
  side: "blue" | "red";
  userTeamId: string | undefined;
}) {
  if (!match) {
    return (
      <div className="first-stand-bracket-team first-stand-bracket-team-placeholder">
        <span>{label}</span>
        <strong>대기 중</strong>
        <small>이전 단계 결과 대기</small>
      </div>
    );
  }

  const teamId = side === "blue" ? match.blueTeamId : match.redTeamId;
  const teamName = side === "blue" ? match.blueTeamName : match.redTeamName;
  const teamScore = record
    ? side === "blue"
      ? record.score.blueWins
      : record.score.redWins
    : undefined;
  const opponentScore = record
    ? side === "blue"
      ? record.score.redWins
      : record.score.blueWins
    : undefined;
  const classes = [
    "first-stand-bracket-team",
    teamId === userTeamId ? "first-stand-bracket-team-user" : "",
    record?.winnerTeamId === teamId ? "first-stand-bracket-team-winner" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <span>{label}</span>
      <strong>{teamName}</strong>
      <small>
        {record
          ? `${teamScore}-${opponentScore}${record.winnerTeamId === teamId ? " 승" : ""}`
          : `${formatFirstStandDateLabel(match.scheduledDate)} · ${getFormatLabel(match)}`}
      </small>
    </div>
  );
}

function FirstStandBracketMatchCard({
  isCurrent,
  match,
  placeholderLabels,
  record,
  title,
  userTeamId,
}: {
  isCurrent: boolean;
  match: MatchSchedule | undefined;
  placeholderLabels: [string, string];
  record: MatchRecord | undefined;
  title: string;
  userTeamId: string | undefined;
}) {
  return (
    <article
      className={`first-stand-bracket-match ${
        isCurrent ? "first-stand-bracket-match-current" : ""
      }`}
    >
      <header>
        <strong>{title}</strong>
        <span>{match ? getFirstStandMatchStatusLabel(match, record) : "대기 중"}</span>
      </header>
      <FirstStandBracketTeam
        label={placeholderLabels[0]}
        match={match}
        record={record}
        side="blue"
        userTeamId={userTeamId}
      />
      <FirstStandBracketTeam
        label={placeholderLabels[1]}
        match={match}
        record={record}
        side="red"
        userTeamId={userTeamId}
      />
    </article>
  );
}

export function FirstStandBracketView({
  competition,
  records,
  userTeamId,
}: {
  competition: CompetitionState;
  records: MatchRecord[];
  userTeamId: string | undefined;
}) {
  const recordsByScheduleId = getRecordByScheduleId(records);
  const semifinalA = getFirstStandBracketMatch(
    competition,
    firstStandMatchIds.semifinalA1VsB2,
  );
  const semifinalB = getFirstStandBracketMatch(
    competition,
    firstStandMatchIds.semifinalB1VsA2,
  );
  const final = getFirstStandBracketMatch(competition, firstStandMatchIds.final);
  const finalists = getFirstStandFinalists(competition, records);
  const championName =
    competition.winnerTeamName ?? finalists[0]?.teamName ?? "우승팀 미정";
  const runnerUpName = finalists[1]?.teamName ?? "준우승팀 미정";
  const currentStageName = competition.completed ? "완료" : competition.currentStageName;

  return (
    <section className="competition-panel first-stand-main-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">토너먼트</p>
          <h2>First Stand 토너먼트</h2>
        </div>
        <span className="panel-note">A/B조 상위 2팀이 BO5 토너먼트에 진출합니다</span>
      </div>
      <div className="first-stand-bracket-frame">
        <div className="first-stand-bracket">
          <section
            className={`first-stand-bracket-round ${
              currentStageName === firstStandStageNames.semifinals
                ? "first-stand-bracket-round-current"
                : ""
            }`}
          >
            <h3>준결승</h3>
            <div className="first-stand-bracket-stack">
              <FirstStandBracketMatchCard
                isCurrent={currentStageName === firstStandStageNames.semifinals}
                match={semifinalA}
                placeholderLabels={["A조 1위", "B조 2위"]}
                record={semifinalA ? recordsByScheduleId.get(semifinalA.id) : undefined}
                title="준결승 A"
                userTeamId={userTeamId}
              />
              <FirstStandBracketMatchCard
                isCurrent={currentStageName === firstStandStageNames.semifinals}
                match={semifinalB}
                placeholderLabels={["B조 1위", "A조 2위"]}
                record={semifinalB ? recordsByScheduleId.get(semifinalB.id) : undefined}
                title="준결승 B"
                userTeamId={userTeamId}
              />
            </div>
          </section>
          <section
            className={`first-stand-bracket-round ${
              currentStageName === firstStandStageNames.final
                ? "first-stand-bracket-round-current"
                : ""
            }`}
          >
            <h3>결승</h3>
            <div className="first-stand-bracket-stack">
              <FirstStandBracketMatchCard
                isCurrent={currentStageName === firstStandStageNames.final}
                match={final}
                placeholderLabels={["준결승 A 승자", "준결승 B 승자"]}
                record={final ? recordsByScheduleId.get(final.id) : undefined}
                title="결승"
                userTeamId={userTeamId}
              />
            </div>
          </section>
          <section
            className={`first-stand-bracket-round first-stand-bracket-champion-round ${
              competition.completed ? "first-stand-bracket-round-current" : ""
            }`}
          >
            <h3>우승</h3>
            <article className="first-stand-bracket-champion">
              <span>{competition.completed ? "우승팀" : "대기 중"}</span>
              <strong>{championName}</strong>
              <small>
                {competition.completed
                  ? `준우승: ${runnerUpName}`
                  : "결승 결과 대기"}
              </small>
            </article>
          </section>
        </div>
      </div>
    </section>
  );
}
