import { useState } from "react";
import type { CompetitionSubPage } from "../../app/routes";
import {
  getWorldsEntryStage,
  getWorldsGroupStandings,
  getWorldsGroupTitle,
  splitWorldsEntrants,
  worldsMatchIds,
  worldsStageNames,
} from "../../domain/season";
import type {
  CareerSave,
  CompetitionState,
  MatchRecord,
  MatchSchedule,
  StandingEntry,
  WorldsEntrant,
  WorldsGroupAssignment,
  WorldsGroupId,
} from "../../types/game";
import {
  formatWorldsBonusLeagueLabel,
  getCompetitionScheduleGroups,
  getDateLabel,
  getFormatLabel,
  getMatchTitle,
  getRecordByScheduleId,
  getScheduleStatusClass,
  getScoreLabel,
  getSetDiff,
  getUserTeamId,
} from "./competitionDashboardShared";

type WorldsDashboardTab = "overview" | "schedule" | "groups" | "bracket";
function isWorldsDashboardTab(
  value: CompetitionSubPage | null | undefined,
): value is WorldsDashboardTab {
  return (
    value === "overview" ||
    value === "schedule" ||
    value === "groups" ||
    value === "bracket"
  );
}

const worldsPlayInGroupIds: WorldsGroupId[] = ["play-in-a", "play-in-b"];
const worldsGroupStageGroupIds: WorldsGroupId[] = [
  "group-a",
  "group-b",
  "group-c",
  "group-d",
];

function getWorldsSourceLabel(source: WorldsEntrant["source"]) {
  if (source === "msi-bonus") {
    return "MSI 추가 시드";
  }

  if (source === "lcq-placeholder") {
    return "LCQ placeholder";
  }

  return "지역 기본 시드";
}

function getWorldsStageLabel(entrant: WorldsEntrant) {
  return getWorldsEntryStage(entrant) === "direct"
    ? "Group Stage 직행"
    : "Play-In";
}

function WorldsTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: WorldsDashboardTab;
  onTabChange: (tab: WorldsDashboardTab) => void;
}) {
  const tabs: Array<{ id: WorldsDashboardTab; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "schedule", label: "Schedule" },
    { id: "groups", label: "Groups" },
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

function WorldsSummary({
  career,
  competition,
}: {
  career: CareerSave;
  competition: CompetitionState;
}) {
  const qualification = career.seasonState.worldsQualification;
  const worldsState = career.seasonState.worlds;
  const lckQualifiedSeeds =
    qualification?.lckSeeds.filter((seed) => seed.status === "qualified") ?? [];
  const bonusLabel = formatWorldsBonusLeagueLabel(qualification);
  const entrantCount =
    qualification?.totalEntrants ?? competition.qualifiedTeamIds.length;
  const statusLabel = competition.completed
    ? competition.winnerTeamName
      ? `${competition.winnerTeamName} 우승`
      : "Completed"
    : worldsState?.status === "play-in"
      ? "Play-In 진행"
      : worldsState?.status === "group-stage"
        ? "Group Stage 진행"
        : worldsState?.status === "knockout"
          ? "Knockout 진행"
          : competition.currentStageName;

  return (
    <section className="competition-summary-grid competition-summary-grid-compact">
      <article className="competition-summary-card competition-summary-card-wide">
        <p className="eyebrow">International</p>
        <h1>{competition.name}</h1>
        <span>{career.seasonState.currentDateLabel}</span>
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">Status</p>
        <strong>{statusLabel}</strong>
        <span>Play-In · Group Stage · Knockout</span>
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">Entrants</p>
        <strong>{entrantCount || 20} teams</strong>
        <span>12팀 직행 · 8팀 Play-In</span>
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">MSI Bonus</p>
        <strong>{bonusLabel}</strong>
        <span>상위 2개 리그에 보너스 시드</span>
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">LCK Seeds</p>
        <strong>
          {lckQualifiedSeeds.length
            ? lckQualifiedSeeds.map((seed) => seed.teamName).join(" / ")
            : "진출팀 대기"}
        </strong>
        <span>
          {qualification?.bonusLeagueLabels.includes("LCK")
            ? "LCK 4시드 포함"
            : "LCK 기본 3시드"}
        </span>
      </article>
    </section>
  );
}

function WorldsEntrantCard({
  entrant,
  userTeamId,
}: {
  entrant: WorldsEntrant;
  userTeamId: string;
}) {
  return (
    <article
      className={`worlds-entrant-card worlds-entrant-${entrant.source} ${
        entrant.teamId === userTeamId ? "worlds-entrant-user" : ""
      }`}
    >
      <span>{entrant.slotLabel}</span>
      <strong>{entrant.teamName}</strong>
      <small>
        {entrant.leagueLabel} · {getWorldsStageLabel(entrant)} ·{" "}
        {getWorldsSourceLabel(entrant.source)}
      </small>
    </article>
  );
}

function WorldsOverview({
  career,
  competition,
  userTeamId,
}: {
  career: CareerSave;
  competition: CompetitionState;
  userTeamId: string;
}) {
  const qualification = career.seasonState.worldsQualification;
  const entrants = qualification?.entrants ?? [];
  const { directEntrants, playInEntrants } = splitWorldsEntrants(entrants);
  const lckSeeds = qualification?.lckSeeds ?? [];

  return (
    <section className="competition-panel worlds-pool-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Worlds 참가 풀</h2>
        </div>
        <span className="panel-note">
          LCK/LPL/LCS/LEC 1-3시드 직행 · 나머지 8팀 Play-In
        </span>
      </div>
      <p className="competition-overview-copy">
        Worlds는 시즌 최종 국제전입니다. 20팀 참가 풀은 지역 시드, MSI 보너스
        시드, LCQ 슬롯으로 구성되며 Play-In, Group Stage, Knockout을 거쳐 최종
        우승팀을 저장합니다.
      </p>
      <div className="worlds-overview-split">
        <article>
          <header>
            <strong>Group Stage 직행</strong>
            <span>{directEntrants.length}/12</span>
          </header>
          <div className="worlds-entrant-grid worlds-entrant-grid-compact">
            {directEntrants.map((entrant) => (
              <WorldsEntrantCard
                entrant={entrant}
                key={entrant.teamId}
                userTeamId={userTeamId}
              />
            ))}
          </div>
        </article>
        <article>
          <header>
            <strong>Play-In</strong>
            <span>{playInEntrants.length}/8</span>
          </header>
          <div className="worlds-entrant-grid worlds-entrant-grid-compact">
            {playInEntrants.map((entrant) => (
              <WorldsEntrantCard
                entrant={entrant}
                key={entrant.teamId}
                userTeamId={userTeamId}
              />
            ))}
          </div>
        </article>
      </div>
      <div className="worlds-lck-path-strip">
        {lckSeeds.map((seed) => (
          <span
            className={`worlds-lck-seed worlds-lck-seed-${seed.status}`}
            key={seed.seed}
          >
            <strong>{seed.seed}시드</strong>
            {seed.teamName}
          </span>
        ))}
        {lckSeeds.length === 0 && (
          <span>MSI와 LCK 후반 결과가 확정되면 LCK Worlds 경로가 표시됩니다.</span>
        )}
      </div>
      {entrants.length === 0 && (
        <div className="competition-empty-state">
          MSI와 LCK 후반 결과가 확정되면 20팀 참가 풀이 표시됩니다.
        </div>
      )}
      {competition.completed && competition.winnerTeamName && (
        <div className="worlds-champion-strip">
          <span>Worlds Champion</span>
          <strong>{competition.winnerTeamName}</strong>
        </div>
      )}
    </section>
  );
}

function WorldsScheduleView({
  competition,
  records,
  userTeamId,
}: {
  competition: CompetitionState;
  records: MatchRecord[];
  userTeamId: string;
}) {
  const recordsByScheduleId = getRecordByScheduleId(records);
  const groups = getCompetitionScheduleGroups(competition);

  return (
    <section className="competition-panel worlds-schedule-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Schedule</p>
          <h2>Worlds 일정 / 결과</h2>
        </div>
        <span className="panel-note">Play-In/Group BO1 · Knockout BO5</span>
      </div>
      <div className="worlds-schedule-list">
        {groups.map((group) => (
          <article className="worlds-schedule-day" key={group.dateKey}>
            <header>{getDateLabel(group.dateKey)}</header>
            {group.matches.map((match) => {
              const record = recordsByScheduleId.get(match.id);
              const isUserMatch =
                match.blueTeamId === userTeamId || match.redTeamId === userTeamId;

              return (
                <div
                  className={`worlds-schedule-row ${
                    isUserMatch ? "worlds-schedule-user" : ""
                  }`}
                  key={match.id}
                >
                  <div>
                    <strong>{getMatchTitle(match)}</strong>
                    <span>
                      {match.stageName} · {getFormatLabel(match)}
                    </span>
                  </div>
                  <span className={getScheduleStatusClass({ match, record, userTeamId })}>
                    {getScoreLabel(record)}
                  </span>
                </div>
              );
            })}
          </article>
        ))}
        {groups.length === 0 && (
          <div className="competition-empty-state">
            Worlds가 활성화되면 Play-In 일정부터 표시됩니다.
          </div>
        )}
      </div>
    </section>
  );
}

function WorldsGroupTable({
  assignments,
  competition,
  groupId,
  records,
  userTeamId,
}: {
  assignments: WorldsGroupAssignment[];
  competition: CompetitionState;
  groupId: WorldsGroupId;
  records: MatchRecord[];
  userTeamId: string;
}) {
  const standings = getWorldsGroupStandings({
    assignments,
    competition,
    groupId,
    records,
  });

  return (
    <article className="worlds-group-card">
      <header>
        <strong>{getWorldsGroupTitle(groupId)}</strong>
        <span>상위 2팀 진출</span>
      </header>
      <div className="worlds-group-table worlds-group-header">
        <span>#</span>
        <span>팀</span>
        <span>리그</span>
        <span>승</span>
        <span>패</span>
        <span>세트</span>
      </div>
      <div className="worlds-group-table-scroll">
        {standings.map((entry) => {
          const assignment = assignments.find(
            (candidate) => candidate.teamId === entry.teamId,
          );

          return (
            <div
              className={`worlds-group-table ${
                entry.teamId === userTeamId ? "worlds-group-user" : ""
              }`}
              key={`${groupId}-${entry.teamId}`}
            >
              <span>{entry.rank}</span>
              <strong>{entry.teamName}</strong>
              <span>{assignment?.leagueLabel ?? "-"}</span>
              <span>{entry.wins}</span>
              <span>{entry.losses}</span>
              <span>{getSetDiff(entry)}</span>
            </div>
          );
        })}
        {standings.length === 0 && (
          <div className="competition-empty-state">조 편성 대기</div>
        )}
      </div>
    </article>
  );
}

function WorldsGroupsView({
  career,
  competition,
  records,
  userTeamId,
}: {
  career: CareerSave;
  competition: CompetitionState;
  records: MatchRecord[];
  userTeamId: string;
}) {
  const worldsState = career.seasonState.worlds;
  const playInAssignments = worldsState?.playInGroups ?? [];
  const groupStageAssignments = worldsState?.groupStageGroups ?? [];

  return (
    <section className="competition-panel worlds-groups-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Groups</p>
          <h2>Worlds 조별 순위</h2>
        </div>
        <span className="panel-note">승수 · 세트 득실 · 세트 승수 · 초기 시드</span>
      </div>
      <div className="worlds-groups-section">
        <header>
          <strong>Play-In</strong>
          <span>4팀 2개 조 · 싱글 라운드 로빈</span>
        </header>
        <div className="worlds-groups-grid">
          {worldsPlayInGroupIds.map((groupId) => (
            <WorldsGroupTable
              assignments={playInAssignments}
              competition={competition}
              groupId={groupId}
              key={groupId}
              records={records}
              userTeamId={userTeamId}
            />
          ))}
        </div>
      </div>
      <div className="worlds-groups-section">
        <header>
          <strong>Group Stage</strong>
          <span>4팀 4개 조 · 더블 라운드 로빈</span>
        </header>
        <div className="worlds-groups-grid worlds-groups-grid-four">
          {worldsGroupStageGroupIds.map((groupId) => (
            <WorldsGroupTable
              assignments={groupStageAssignments}
              competition={competition}
              groupId={groupId}
              key={groupId}
              records={records}
              userTeamId={userTeamId}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function getWorldsTeamClass({
  teamId,
  record,
  userTeamId,
}: {
  teamId: string;
  record?: MatchRecord;
  userTeamId: string;
}) {
  return [
    "worlds-bracket-team",
    teamId === userTeamId ? "worlds-bracket-team-user" : "",
    record?.winnerTeamId === teamId ? "worlds-bracket-team-winner" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function WorldsBracketMatchCard({
  match,
  placeholder,
  record,
  userTeamId,
}: {
  match?: MatchSchedule;
  placeholder: string;
  record?: MatchRecord;
  userTeamId: string;
}) {
  if (!match) {
    return (
      <article className="worlds-bracket-match worlds-bracket-placeholder">
        <strong>{placeholder}</strong>
        <span>진출팀 대기</span>
      </article>
    );
  }

  return (
    <article className="worlds-bracket-match">
      <header>
        <strong>{match.stageName}</strong>
        <span>
          {getDateLabel(match.scheduledDate)} · {getFormatLabel(match)}
        </span>
      </header>
      <div className="worlds-bracket-slots">
        <span className={getWorldsTeamClass({ teamId: match.blueTeamId, record, userTeamId })}>
          {match.blueTeamName}
        </span>
        <span className={getWorldsTeamClass({ teamId: match.redTeamId, record, userTeamId })}>
          {match.redTeamName}
        </span>
      </div>
      <small>{getScoreLabel(record)}</small>
    </article>
  );
}

function WorldsBracketView({
  career,
  competition,
  records,
  userTeamId,
}: {
  career: CareerSave;
  competition: CompetitionState;
  records: MatchRecord[];
  userTeamId: string;
}) {
  const recordsByScheduleId = getRecordByScheduleId(records);
  const scheduleById = new Map(competition.schedule.map((match) => [match.id, match]));
  const worldsState = career.seasonState.worlds;
  const quarterfinals = [
    {
      id: worldsMatchIds.quarterfinalA1VsB2,
      label: "A1 vs B2",
    },
    {
      id: worldsMatchIds.quarterfinalB1VsA2,
      label: "B1 vs A2",
    },
    {
      id: worldsMatchIds.quarterfinalC1VsD2,
      label: "C1 vs D2",
    },
    {
      id: worldsMatchIds.quarterfinalD1VsC2,
      label: "D1 vs C2",
    },
  ];
  const semifinals = [
    {
      id: worldsMatchIds.semifinalTop,
      label: "QF 1/2 승자",
    },
    {
      id: worldsMatchIds.semifinalBottom,
      label: "QF 3/4 승자",
    },
  ];

  return (
    <section className="competition-panel worlds-bracket-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Bracket</p>
          <h2>Worlds Knockout</h2>
        </div>
        <span className="panel-note">8강 · 4강 · 결승 전 경기 BO5</span>
      </div>
      <div className="worlds-bracket-frame">
        <div className="worlds-bracket-round">
          <h3>{worldsStageNames.quarterfinals}</h3>
          <div className="worlds-bracket-stack">
            {quarterfinals.map((item) => (
              <WorldsBracketMatchCard
                key={item.id}
                match={scheduleById.get(item.id)}
                placeholder={item.label}
                record={recordsByScheduleId.get(item.id)}
                userTeamId={userTeamId}
              />
            ))}
          </div>
        </div>
        <div className="worlds-bracket-round">
          <h3>{worldsStageNames.semifinals}</h3>
          <div className="worlds-bracket-stack worlds-bracket-stack-centered">
            {semifinals.map((item) => (
              <WorldsBracketMatchCard
                key={item.id}
                match={scheduleById.get(item.id)}
                placeholder={item.label}
                record={recordsByScheduleId.get(item.id)}
                userTeamId={userTeamId}
              />
            ))}
          </div>
        </div>
        <div className="worlds-bracket-round">
          <h3>{worldsStageNames.final}</h3>
          <div className="worlds-bracket-stack worlds-bracket-stack-final">
            <WorldsBracketMatchCard
              match={scheduleById.get(worldsMatchIds.final)}
              placeholder="Semifinal 승자"
              record={recordsByScheduleId.get(worldsMatchIds.final)}
              userTeamId={userTeamId}
            />
          </div>
        </div>
        <article className="worlds-champion-card">
          <span>Worlds Champion</span>
          <strong>
            {worldsState?.championTeamName ??
              competition.winnerTeamName ??
              "우승팀 미정"}
          </strong>
          <small>
            Runner-up:{" "}
            {worldsState?.runnerUpTeamName ??
              (competition.completed ? "기록 없음" : "미정")}
          </small>
        </article>
      </div>
    </section>
  );
}

function getWorldsUserTeamId(career: CareerSave, competition: CompetitionState) {
  return (
    getUserTeamId(competition) ??
    career.seasonState.worldsQualification?.entrants.find(
      (entrant) => entrant.teamName === career.userTeam.name,
    )?.teamId ??
    ""
  );
}

export function WorldsDashboard({
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
  const [fallbackTab, setFallbackTab] = useState<WorldsDashboardTab>("overview");
  const activeTab = isWorldsDashboardTab(subPage) ? subPage : fallbackTab;
  const userTeamId = getWorldsUserTeamId(career, competition);
  const handleTabChange = (nextTab: WorldsDashboardTab) => {
    if (onSubPageChange) {
      onSubPageChange(nextTab);
      return;
    }

    setFallbackTab(nextTab);
  };

  return (
    <section className="competition-dashboard worlds-dashboard">
      <WorldsSummary career={career} competition={competition} />
      <WorldsTabs activeTab={activeTab} onTabChange={handleTabChange} />
      {activeTab === "overview" && (
        <WorldsOverview
          career={career}
          competition={competition}
          userTeamId={userTeamId}
        />
      )}
      {activeTab === "schedule" && (
        <WorldsScheduleView
          competition={competition}
          records={records}
          userTeamId={userTeamId}
        />
      )}
      {activeTab === "groups" && (
        <WorldsGroupsView
          career={career}
          competition={competition}
          records={records}
          userTeamId={userTeamId}
        />
      )}
      {activeTab === "bracket" && (
        <WorldsBracketView
          career={career}
          competition={competition}
          records={records}
          userTeamId={userTeamId}
        />
      )}
    </section>
  );
}
