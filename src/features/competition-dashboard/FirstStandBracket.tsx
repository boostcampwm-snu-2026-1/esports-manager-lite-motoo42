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
        <strong>Pending</strong>
        <small>Waiting for previous stage</small>
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
          ? `${teamScore}-${opponentScore}${record.winnerTeamId === teamId ? " Win" : ""}`
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
        <span>{match ? getFirstStandMatchStatusLabel(match, record) : "Pending"}</span>
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
    competition.winnerTeamName ?? finalists[0]?.teamName ?? "Champion TBD";
  const runnerUpName = finalists[1]?.teamName ?? "Runner-up TBD";
  const currentStageName = competition.completed ? "Completed" : competition.currentStageName;

  return (
    <section className="competition-panel first-stand-main-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Tournament</p>
          <h2>First Stand Tournament</h2>
        </div>
        <span className="panel-note">Four teams advance: Group A/B top two, BO5 bracket</span>
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
            <h3>Semifinals</h3>
            <div className="first-stand-bracket-stack">
              <FirstStandBracketMatchCard
                isCurrent={currentStageName === firstStandStageNames.semifinals}
                match={semifinalA}
                placeholderLabels={["Group A 1", "Group B 2"]}
                record={semifinalA ? recordsByScheduleId.get(semifinalA.id) : undefined}
                title="Semifinal A"
                userTeamId={userTeamId}
              />
              <FirstStandBracketMatchCard
                isCurrent={currentStageName === firstStandStageNames.semifinals}
                match={semifinalB}
                placeholderLabels={["Group B 1", "Group A 2"]}
                record={semifinalB ? recordsByScheduleId.get(semifinalB.id) : undefined}
                title="Semifinal B"
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
            <h3>Final</h3>
            <div className="first-stand-bracket-stack">
              <FirstStandBracketMatchCard
                isCurrent={currentStageName === firstStandStageNames.final}
                match={final}
                placeholderLabels={["Semifinal A Winner", "Semifinal B Winner"]}
                record={final ? recordsByScheduleId.get(final.id) : undefined}
                title="Final"
                userTeamId={userTeamId}
              />
            </div>
          </section>
          <section
            className={`first-stand-bracket-round first-stand-bracket-champion-round ${
              competition.completed ? "first-stand-bracket-round-current" : ""
            }`}
          >
            <h3>Champion</h3>
            <article className="first-stand-bracket-champion">
              <span>{competition.completed ? "Champion" : "Pending"}</span>
              <strong>{championName}</strong>
              <small>
                {competition.completed
                  ? `Runner-up: ${runnerUpName}`
                  : "Final result pending"}
              </small>
            </article>
          </section>
        </div>
      </div>
    </section>
  );
}
