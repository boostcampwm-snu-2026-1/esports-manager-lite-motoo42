import { useState } from "react";
import type { CompetitionSubPage } from "../../app/routes";
import {
  getMsiLeagueForTeam,
  msiMatchIds,
  msiStageNames,
} from "../../domain/season";
import type {
  CareerSave,
  CompetitionState,
  MatchRecord,
  MatchSchedule,
  StandingEntry,
  WorldsQualificationState,
} from "../../types/game";
import {
  formatWorldsBonusLeagueLabel,
  getDateLabel,
  getFormatLabel,
  getMatchTitle,
  getRecordByScheduleId,
  getScheduleStatusClass,
  getScoreLabel,
  getUserTeamId,
  groupMatchesByDate,
} from "./competitionDashboardShared";

type MsiDashboardTab = "overview" | "schedule" | "bracket";
function isMsiDashboardTab(
  value: CompetitionSubPage | null | undefined,
): value is MsiDashboardTab {
  return value === "overview" || value === "schedule" || value === "bracket";
}
type MsiEntrantView = {
  teamId: string;
  teamName: string;
  leagueLabel: string;
  seedLabel: string;
  entryStage: "Bracket Stage" | "Play-In";
  initialSeed: number;
  isUserTeam: boolean;
};

type MsiBracketRound = {
  id: string;
  title: string;
  stageName: string;
  matchIds: string[];
  placeholders: Array<[string, string]>;
};

const msiPlayInOpeningMatchIds: string[] = [
  msiMatchIds.playInSemifinal1,
  msiMatchIds.playInSemifinal2,
];

const msiBo5MatchIds = new Set<string>([
  msiMatchIds.playInFinal,
  msiMatchIds.upperFinal,
  msiMatchIds.lowerFinal,
  msiMatchIds.grandFinal,
]);

const msiPlayInRounds: MsiBracketRound[] = [
  {
    id: "play-in-semifinals",
    title: "Semifinals",
    stageName: msiStageNames.playInSemifinals,
    matchIds: [msiMatchIds.playInSemifinal1, msiMatchIds.playInSemifinal2],
    placeholders: [
      ["Play-In seed 1", "Play-In seed 4"],
      ["Play-In seed 2", "Play-In seed 3"],
    ],
  },
  {
    id: "play-in-final",
    title: "Final",
    stageName: msiStageNames.playInFinal,
    matchIds: [msiMatchIds.playInFinal],
    placeholders: [["Semifinal 1 Winner", "Semifinal 2 Winner"]],
  },
];

const msiUpperRounds: MsiBracketRound[] = [
  {
    id: "upper-round-1",
    title: "Upper Round 1",
    stageName: msiStageNames.upperRound1,
    matchIds: [
      msiMatchIds.upperRound1A,
      msiMatchIds.upperRound1B,
      msiMatchIds.upperRound1C,
      msiMatchIds.upperRound1D,
    ],
    placeholders: [
      ["Bracket seed", "Bracket seed"],
      ["Bracket seed", "Bracket seed"],
      ["Bracket seed", "Bracket seed"],
      ["Bracket seed", "Play-In Winner"],
    ],
  },
  {
    id: "upper-round-2",
    title: "Upper Round 2",
    stageName: msiStageNames.upperRound2,
    matchIds: [msiMatchIds.upperRound2A, msiMatchIds.upperRound2B],
    placeholders: [
      ["Upper R1 A Winner", "Upper R1 B Winner"],
      ["Upper R1 C Winner", "Upper R1 D Winner"],
    ],
  },
  {
    id: "upper-final",
    title: "Upper Final",
    stageName: msiStageNames.upperFinal,
    matchIds: [msiMatchIds.upperFinal],
    placeholders: [["Upper R2 A Winner", "Upper R2 B Winner"]],
  },
];

const msiLowerRounds: MsiBracketRound[] = [
  {
    id: "lower-round-1",
    title: "Lower Round 1",
    stageName: msiStageNames.lowerRound1,
    matchIds: [msiMatchIds.lowerRound1A, msiMatchIds.lowerRound1B],
    placeholders: [
      ["Upper R1 A/C Loser", "Upper R1 A/C Loser"],
      ["Upper R1 B/D Loser", "Upper R1 B/D Loser"],
    ],
  },
  {
    id: "lower-round-2",
    title: "Lower Round 2",
    stageName: msiStageNames.lowerRound2,
    matchIds: [msiMatchIds.lowerRound2A, msiMatchIds.lowerRound2B],
    placeholders: [
      ["Upper R2 A Loser", "Lower R1 Winner"],
      ["Upper R2 B Loser", "Lower R1 Winner"],
    ],
  },
  {
    id: "lower-round-3",
    title: "Lower Round 3",
    stageName: msiStageNames.lowerRound3,
    matchIds: [msiMatchIds.lowerRound3],
    placeholders: [["Lower R2 A Winner", "Lower R2 B Winner"]],
  },
  {
    id: "lower-final",
    title: "Lower Final",
    stageName: msiStageNames.lowerFinal,
    matchIds: [msiMatchIds.lowerFinal],
    placeholders: [["Upper Final Loser", "Lower R3 Winner"]],
  },
];

const msiGrandFinalRound: MsiBracketRound = {
  id: "grand-finals",
  title: "Grand Finals",
  stageName: msiStageNames.grandFinal,
  matchIds: [msiMatchIds.grandFinal],
  placeholders: [["Upper Final Winner", "Lower Final Winner"]],
};

function getMsiPlayInTeamIds(competition: CompetitionState) {
  const teamIds = new Set<string>();

  competition.schedule
    .filter((match) => msiPlayInOpeningMatchIds.includes(match.id))
    .forEach((match) => {
      teamIds.add(match.blueTeamId);
      teamIds.add(match.redTeamId);
    });

  return teamIds;
}

function getMsiSeedLabel(entry: StandingEntry) {
  const leagueLabel = getMsiLeagueForTeam(entry.teamId);

  if (leagueLabel === "LCK") {
    return entry.initialSeed === 1 ? "LCK 1" : "LCK 2";
  }

  const seedMatch = entry.teamId.match(/-(\d)$/);
  const seed = seedMatch?.[1] ?? String(entry.initialSeed);

  return `${leagueLabel} ${seed}`;
}

function getMsiEntrants(competition: CompetitionState): MsiEntrantView[] {
  const playInTeamIds = getMsiPlayInTeamIds(competition);

  return [...competition.standings]
    .sort((left, right) => left.initialSeed - right.initialSeed)
    .map((entry) => ({
      teamId: entry.teamId,
      teamName: entry.teamName,
      leagueLabel: getMsiLeagueForTeam(entry.teamId),
      seedLabel: getMsiSeedLabel(entry),
      entryStage: playInTeamIds.has(entry.teamId) ? "Play-In" : "Bracket Stage",
      initialSeed: entry.initialSeed,
      isUserTeam: entry.isUserTeam,
    }));
}

function getMsiMatchStatusLabel(
  match: MatchSchedule | undefined,
  record: MatchRecord | undefined,
  expectedFormatLabel: string,
) {
  if (!match) {
    return `${expectedFormatLabel} · Pending`;
  }

  if (!record) {
    return `${getFormatLabel(match)} · Scheduled`;
  }

  return `${record.score.blueWins}-${record.score.redWins}`;
}

function getMsiExpectedFormatLabel(matchId: string) {
  return msiBo5MatchIds.has(matchId) ? "BO5" : "BO3";
}

function isMsiStageCurrent(stageName: string, competition: CompetitionState) {
  if (competition.completed) {
    return false;
  }

  if (stageName === competition.currentStageName) {
    return true;
  }

  const pairedStages: Record<string, string[]> = {
    [msiStageNames.upperRound2]: [msiStageNames.lowerRound1],
    [msiStageNames.upperFinal]: [msiStageNames.lowerRound2],
  };

  return pairedStages[competition.currentStageName]?.includes(stageName) ?? false;
}

function MsiTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: MsiDashboardTab;
  onTabChange: (tab: MsiDashboardTab) => void;
}) {
  const tabs: Array<{ id: MsiDashboardTab; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "schedule", label: "Schedule" },
    { id: "bracket", label: "Bracket" },
  ];

  return (
    <div className="competition-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          className={`competition-tab ${
            activeTab === tab.id ? "competition-tab-active" : ""
          }`}
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function MsiSummary({
  career,
  competition,
  entrants,
}: {
  career: CareerSave;
  competition: CompetitionState;
  entrants: MsiEntrantView[];
}) {
  const directEntrants = entrants.filter(
    (entrant) => entrant.entryStage === "Bracket Stage",
  );
  const playInEntrants = entrants.filter((entrant) => entrant.entryStage === "Play-In");
  const lckEntrants = entrants.filter((entrant) => entrant.leagueLabel === "LCK");
  const championLabel = competition.completed
    ? competition.winnerTeamName ?? "Champion TBD"
    : competition.currentStageName;
  const worldsQualification = career.seasonState.worldsQualification;

  return (
    <section className="competition-summary-grid competition-summary-grid-compact msi-summary-grid">
      <article className="competition-summary-card competition-summary-card-wide">
        <p className="eyebrow">International</p>
        <h1>{competition.name}</h1>
        <span>{career.seasonState.currentDateLabel}</span>
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">Stage</p>
        <strong>{championLabel}</strong>
        <span>{competition.completed ? "Tournament completed" : "MSI in progress"}</span>
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">Entrants</p>
        <strong>{entrants.length} teams</strong>
        <span>
          {directEntrants.length} direct · {playInEntrants.length} play-in
        </span>
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">LCK Seeds</p>
        <strong>{lckEntrants.map((entrant) => entrant.teamName).join(" / ")}</strong>
        <span>
          {competition.qualifiedTeamNames[1]
            ? `Runner-up: ${competition.qualifiedTeamNames[1]}`
            : "LCK Rounds 1-2 finalists"}
        </span>
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">Worlds Bonus</p>
        <strong>{formatWorldsBonusLeagueLabel(worldsQualification)}</strong>
        <span>
          {worldsQualification
            ? `Worlds ${worldsQualification.totalEntrants}팀 풀 반영`
            : "MSI 완료 후 상위 2개 리그 확정"}
        </span>
      </article>
    </section>
  );
}

function MsiEntrantCard({ entrant }: { entrant: MsiEntrantView }) {
  return (
    <article
      className={`msi-entrant-card ${
        entrant.isUserTeam ? "msi-entrant-card-user" : ""
      }`}
    >
      <span>{entrant.seedLabel}</span>
      <strong>{entrant.teamName}</strong>
      <small>
        {entrant.leagueLabel} · {entrant.entryStage}
      </small>
      <em>Initial seed #{entrant.initialSeed}</em>
    </article>
  );
}

function MsiWorldsBonusStrip({
  qualification,
}: {
  qualification: WorldsQualificationState | undefined;
}) {
  if (!qualification) {
    return (
      <div className="msi-worlds-bonus-strip">
        <span>Worlds 추가 시드</span>
        <strong>MSI 결과 대기</strong>
        <small>상위 2개 리그가 Worlds 보너스 시드를 받습니다.</small>
      </div>
    );
  }

  return (
    <div className="msi-worlds-bonus-strip">
      <span>Worlds 추가 시드</span>
      <strong>{qualification.bonusLeagueLabels.join(" / ")}</strong>
      <small>
        {qualification.msiLeagueResults
          .slice(0, 2)
          .map((result) => `${result.leagueLabel}: ${result.bestTeamName}`)
          .join(" · ")}
      </small>
    </div>
  );
}

function MsiOverview({
  entrants,
  qualification,
}: {
  entrants: MsiEntrantView[];
  qualification: WorldsQualificationState | undefined;
}) {
  const directEntrants = entrants.filter(
    (entrant) => entrant.entryStage === "Bracket Stage",
  );
  const playInEntrants = entrants.filter((entrant) => entrant.entryStage === "Play-In");

  return (
    <section className="competition-panel msi-main-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>MSI 참가팀과 진출 경로</h2>
        </div>
        <span className="panel-note">1시드 6팀과 First Stand 보너스 2시드 직행</span>
      </div>
      <div className="msi-overview-split">
        <article>
          <header>
            <strong>Bracket Stage</strong>
            <span>{directEntrants.length} teams</span>
          </header>
          <div className="msi-entrant-grid">
            {directEntrants.map((entrant) => (
              <MsiEntrantCard entrant={entrant} key={entrant.teamId} />
            ))}
          </div>
        </article>
        <article>
          <header>
            <strong>Play-In</strong>
            <span>{playInEntrants.length} teams</span>
          </header>
          <div className="msi-entrant-grid msi-entrant-grid-compact">
            {playInEntrants.map((entrant) => (
              <MsiEntrantCard entrant={entrant} key={entrant.teamId} />
            ))}
          </div>
        </article>
      </div>
      <div className="first-stand-format-strip msi-format-strip">
        <span>Play-In · 4 teams · BO3/BO5</span>
        <span>Upper/Lower Bracket · 8 teams</span>
        <span>Upper Final / Lower Final / Grand Finals · BO5</span>
      </div>
      <p className="competition-overview-copy">
        MSI는 각 지역 상위권 팀이 모여 Worlds 전 국제 서열과 보너스 시드를
        결정하는 대회입니다. 최종 리그 성적 상위 2개 지역은 Worlds 추가 시드를
        획득합니다.
      </p>
      <MsiWorldsBonusStrip qualification={qualification} />
    </section>
  );
}

function MsiScheduleView({
  competition,
  records,
  userTeamId,
}: {
  competition: CompetitionState;
  records: MatchRecord[];
  userTeamId: string | undefined;
}) {
  const recordsByScheduleId = getRecordByScheduleId(records);
  const groupedSchedule = groupMatchesByDate(competition.schedule);

  return (
    <section className="competition-panel msi-main-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Schedule</p>
          <h2>MSI 일정 / 결과</h2>
        </div>
        <span className="panel-note">BO5 경기와 우리 팀 경기 강조</span>
      </div>
      <div className="msi-schedule-scroll">
        {groupedSchedule.map(({ dateKey, matches }) => (
          <article className="first-stand-schedule-day" key={dateKey}>
            <header>
              <strong>{getDateLabel(dateKey)}</strong>
              <span>{matches.length} series</span>
            </header>
            <div className="first-stand-schedule-day-list">
              {matches.map((match) => {
                const record = recordsByScheduleId.get(match.id);
                const isUserMatch =
                  match.blueTeamId === userTeamId || match.redTeamId === userTeamId;
                const isFeatureMatch = match.format === "bo5";

                return (
                  <div
                    className={`msi-schedule-row ${
                      isUserMatch ? "msi-schedule-row-user" : ""
                    } ${isFeatureMatch ? "msi-schedule-row-feature" : ""}`}
                    key={match.id}
                  >
                    <div>
                      <strong>{getMatchTitle(match)}</strong>
                      <span>
                        {match.stageName} · {getFormatLabel(match)}
                      </span>
                    </div>
                    <b
                      className={`schedule-status-badge ${getScheduleStatusClass({
                        match,
                        record,
                        userTeamId,
                      })}`}
                    >
                      {getMsiMatchStatusLabel(
                        match,
                        record,
                        getMsiExpectedFormatLabel(match.id),
                      )}
                    </b>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function getMsiBracketMatch(competition: CompetitionState, matchId: string) {
  return competition.schedule.find((match) => match.id === matchId);
}

function MsiBracketTeam({
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
      <div className="msi-bracket-team msi-bracket-team-placeholder">
        <span>{label}</span>
        <strong>Pending</strong>
        <small>Waiting for previous match</small>
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
    "msi-bracket-team",
    teamId === userTeamId ? "msi-bracket-team-user" : "",
    record?.winnerTeamId === teamId ? "msi-bracket-team-winner" : "",
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
          : `${getMsiLeagueForTeam(teamId)} · ${getFormatLabel(match)}`}
      </small>
    </div>
  );
}

function MsiBracketMatchCard({
  competition,
  matchId,
  placeholderLabels,
  recordsByScheduleId,
  title,
  userTeamId,
}: {
  competition: CompetitionState;
  matchId: string;
  placeholderLabels: [string, string];
  recordsByScheduleId: Map<string, MatchRecord>;
  title: string;
  userTeamId: string | undefined;
}) {
  const match = getMsiBracketMatch(competition, matchId);
  const record = match ? recordsByScheduleId.get(match.id) : undefined;
  const expectedFormatLabel = getMsiExpectedFormatLabel(matchId);
  const isCurrent = match ? isMsiStageCurrent(match.stageName, competition) : false;
  const isBo5 = match?.format === "bo5" || msiBo5MatchIds.has(matchId);

  return (
    <article
      className={`msi-bracket-match ${isCurrent ? "msi-bracket-match-current" : ""}`}
    >
      <header>
        <strong>{title}</strong>
        <span className={isBo5 ? "msi-format-badge msi-format-badge-feature" : "msi-format-badge"}>
          {expectedFormatLabel}
        </span>
      </header>
      <MsiBracketTeam
        label={placeholderLabels[0]}
        match={match}
        record={record}
        side="blue"
        userTeamId={userTeamId}
      />
      <MsiBracketTeam
        label={placeholderLabels[1]}
        match={match}
        record={record}
        side="red"
        userTeamId={userTeamId}
      />
      <small className="msi-bracket-match-status">
        {getMsiMatchStatusLabel(match, record, expectedFormatLabel)}
      </small>
    </article>
  );
}

function MsiBracketRoundView({
  competition,
  recordsByScheduleId,
  round,
  userTeamId,
}: {
  competition: CompetitionState;
  recordsByScheduleId: Map<string, MatchRecord>;
  round: MsiBracketRound;
  userTeamId: string | undefined;
}) {
  const isCurrent = isMsiStageCurrent(round.stageName, competition);

  return (
    <section
      className={`msi-bracket-round ${isCurrent ? "msi-bracket-round-current" : ""}`}
    >
      <h3>{round.title}</h3>
      <div className="msi-bracket-match-stack">
        {round.matchIds.map((matchId, index) => (
          <MsiBracketMatchCard
            competition={competition}
            key={matchId}
            matchId={matchId}
            placeholderLabels={round.placeholders[index] ?? ["Pending", "Pending"]}
            recordsByScheduleId={recordsByScheduleId}
            title={`${round.title} ${round.matchIds.length > 1 ? index + 1 : ""}`.trim()}
            userTeamId={userTeamId}
          />
        ))}
      </div>
    </section>
  );
}

function MsiBracketSection({
  className,
  competition,
  recordsByScheduleId,
  rounds,
  title,
  userTeamId,
}: {
  className: string;
  competition: CompetitionState;
  recordsByScheduleId: Map<string, MatchRecord>;
  rounds: MsiBracketRound[];
  title: string;
  userTeamId: string | undefined;
}) {
  return (
    <article className={`msi-bracket-section ${className}`}>
      <header>
        <strong>{title}</strong>
      </header>
      <div className="msi-bracket-round-grid">
        {rounds.map((round) => (
          <MsiBracketRoundView
            competition={competition}
            key={round.id}
            recordsByScheduleId={recordsByScheduleId}
            round={round}
            userTeamId={userTeamId}
          />
        ))}
      </div>
    </article>
  );
}

function MsiBracketView({
  competition,
  records,
  userTeamId,
}: {
  competition: CompetitionState;
  records: MatchRecord[];
  userTeamId: string | undefined;
}) {
  const recordsByScheduleId = getRecordByScheduleId(records);
  const championName = competition.winnerTeamName ?? "Champion TBD";
  const runnerUpName = competition.qualifiedTeamNames[1] ?? "Runner-up TBD";

  return (
    <section className="competition-panel msi-main-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Bracket</p>
          <h2>MSI Bracket Stage</h2>
        </div>
        <span className="panel-note">Play-In winner joins the upper/lower bracket</span>
      </div>
      <div className="msi-bracket-frame">
        <div className="msi-bracket-board">
          <MsiBracketSection
            className="msi-bracket-section-play-in"
            competition={competition}
            recordsByScheduleId={recordsByScheduleId}
            rounds={msiPlayInRounds}
            title="Play-In"
            userTeamId={userTeamId}
          />
          <MsiBracketSection
            className="msi-bracket-section-upper"
            competition={competition}
            recordsByScheduleId={recordsByScheduleId}
            rounds={msiUpperRounds}
            title="Upper Bracket"
            userTeamId={userTeamId}
          />
          <MsiBracketSection
            className="msi-bracket-section-lower"
            competition={competition}
            recordsByScheduleId={recordsByScheduleId}
            rounds={msiLowerRounds}
            title="Lower Bracket"
            userTeamId={userTeamId}
          />
          <MsiBracketSection
            className="msi-bracket-section-final"
            competition={competition}
            recordsByScheduleId={recordsByScheduleId}
            rounds={[msiGrandFinalRound]}
            title="Final"
            userTeamId={userTeamId}
          />
          <article className="msi-champion-card">
            <span>{competition.completed ? "Champion" : "Pending"}</span>
            <strong>{championName}</strong>
            <small>
              {competition.completed
                ? `Runner-up: ${runnerUpName}`
                : "Grand Finals result pending"}
            </small>
          </article>
        </div>
      </div>
    </section>
  );
}

export function MsiDashboard({
  career,
  competition,
  subPage,
  onSubPageChange,
  records,
}: {
  career: CareerSave;
  competition: CompetitionState;
  subPage?: CompetitionSubPage | null;
  onSubPageChange?: (subPage: CompetitionSubPage) => void;
  records: MatchRecord[];
}) {
  const [fallbackTab, setFallbackTab] = useState<MsiDashboardTab>("overview");
  const activeTab = isMsiDashboardTab(subPage) ? subPage : fallbackTab;
  const entrants = getMsiEntrants(competition);
  const userTeamId = getUserTeamId(competition);
  const handleTabChange = (nextTab: MsiDashboardTab) => {
    if (onSubPageChange) {
      onSubPageChange(nextTab);
      return;
    }

    setFallbackTab(nextTab);
  };

  return (
    <section className="competition-dashboard msi-dashboard">
      <MsiSummary career={career} competition={competition} entrants={entrants} />
      <MsiTabs activeTab={activeTab} onTabChange={handleTabChange} />
      {activeTab === "overview" && (
        <MsiOverview
          entrants={entrants}
          qualification={career.seasonState.worldsQualification}
        />
      )}
      {activeTab === "schedule" && (
        <MsiScheduleView
          competition={competition}
          records={records}
          userTeamId={userTeamId}
        />
      )}
      {activeTab === "bracket" && (
        <MsiBracketView
          competition={competition}
          records={records}
          userTeamId={userTeamId}
        />
      )}
    </section>
  );
}
