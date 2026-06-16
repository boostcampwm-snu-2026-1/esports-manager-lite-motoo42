import { useState } from "react";
import { getCompetitionTemplate } from "../../data/competitions";
import { findLckTeamSeed, getLckTeamDisplayName } from "../../data/lckTeams";
import type { CompetitionSubPage } from "../../app/routes";
import { TeamLogo } from "../../shared/ui/TeamLogo";
import { getLckCupGroupPointSummary } from "../../domain/season";
import type {
  CareerSave,
  CompetitionState,
  LckCupGroupName,
  MatchRecord,
  StandingEntry,
} from "../../types/game";
import {
  BracketPanel,
  SchedulePanel,
  TeamNameCell,
  getMatchCount,
  getNextWeekMatches,
  getSetDiff,
  getStatusText,
} from "./competitionDashboardShared";

type LckCupDashboardTab = "standings" | "groups" | "schedule" | "tournament";

function isLckCupDashboardTab(
  value: CompetitionSubPage | null | undefined,
): value is LckCupDashboardTab {
  return (
    value === "standings" ||
    value === "groups" ||
    value === "schedule" ||
    value === "tournament"
  );
}

function getLckCupGroupTitle(group: LckCupGroupName) {
  return group === "baron" ? "바론 그룹" : "장로 그룹";
}

function LckCupSummary({
  career,
  competition,
  onViewCalendar,
}: {
  career: CareerSave;
  competition: CompetitionState;
  onViewCalendar?: () => void;
}) {
  const nextMatches = getNextWeekMatches(competition);
  const template = getCompetitionTemplate(competition.competitionId);

  return (
    <section className="competition-summary-grid competition-summary-grid-compact lck-cup-summary-grid">
      <article className="competition-summary-card competition-summary-card-wide">
        <p className="eyebrow">현재 대회</p>
        <h1>{competition.name}</h1>
        <span>{career.seasonState.currentDateLabel}</span>
        {onViewCalendar && (
          <button
            className="button button-ghost competition-calendar-link"
            onClick={onViewCalendar}
            type="button"
          >
            시즌 캘린더
          </button>
        )}
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">단계</p>
        <strong>{getStatusText(competition)}</strong>
        <span>{competition.currentWeek}주차</span>
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">다음 일정</p>
        <strong>
          {nextMatches[0] ? `${nextMatches[0].week}주차` : "예정 경기 없음"}
        </strong>
        <span>
          {nextMatches[0]
            ? `${nextMatches.length}개 시리즈 대기 중`
            : "다음 단계 연결 대기"}
        </span>
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">포맷</p>
        <strong>{template?.entrantsSummary ?? "LCK 10개 팀"}</strong>
        <span>Baron / Elder 그룹 배틀과 토너먼트로 진행됩니다.</span>
      </article>
    </section>
  );
}

function LckCupTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: LckCupDashboardTab;
  onTabChange: (tab: LckCupDashboardTab) => void;
}) {
  const tabs: Array<{ id: LckCupDashboardTab; label: string }> = [
    { id: "standings", label: "순위표" },
    { id: "groups", label: "그룹 포인트" },
    { id: "schedule", label: "일정" },
    { id: "tournament", label: "토너먼트" },
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

function LckCupGroupTeamBadge({
  entry,
  onViewTeam,
}: {
  entry: StandingEntry;
  onViewTeam?: (teamId: string) => void;
}) {
  const lckTeam = findLckTeamSeed(entry.teamId) ?? findLckTeamSeed(entry.teamName);
  const displayName = lckTeam
    ? getLckTeamDisplayName(lckTeam)
    : getLckTeamDisplayName(entry.teamName);
  const content = (
    <>
      <TeamLogo
        team={lckTeam}
        teamId={entry.teamId}
        teamName={entry.teamName}
        size="sm"
      />
      <span>{displayName}</span>
    </>
  );

  if (!lckTeam || !onViewTeam) {
    return <span className="lck-cup-group-team-badge">{content}</span>;
  }

  return (
    <button
      className="lck-cup-group-team-badge lck-cup-group-team-button"
      onClick={() => onViewTeam(lckTeam.id)}
      type="button"
    >
      {content}
    </button>
  );
}

function LckCupGroupPointsPanel({
  onViewTeam,
  records,
  table,
  competition,
}: {
  onViewTeam?: (teamId: string) => void;
  records: MatchRecord[];
  table: StandingEntry[];
  competition: CompetitionState;
}) {
  const summary = getLckCupGroupPointSummary(competition, records);

  return (
    <section className="competition-panel lck-cup-group-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">그룹 포인트</p>
          <h2>Baron / Elder 그룹 포인트</h2>
        </div>
        <span className="panel-note">
          현재 선두: {getLckCupGroupTitle(summary.winnerGroup)}
        </span>
      </div>
      <div className="competition-group-grid lck-cup-group-grid">
        {(["baron", "elder"] as LckCupGroupName[]).map((group) => {
          const groupTeams = table.filter((entry) => entry.lckCupGroup === group);

          return (
            <article
              className={`competition-group-card ${
                summary.winnerGroup === group ? "competition-group-card-leading" : ""
              }`}
              key={group}
            >
              <div className="competition-group-head">
                <strong>{getLckCupGroupTitle(group)}</strong>
                <span>{summary.groups[group].points}Points</span>
              </div>
              <div className="competition-group-team-list lck-cup-group-team-list">
                {groupTeams.map((entry) => (
                  <LckCupGroupTeamBadge
                    entry={entry}
                    key={entry.teamId}
                    onViewTeam={onViewTeam}
                  />
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function LckCupGroupStandingsCard({
  groupPoints,
  group,
  onViewTeam,
  table,
  userTeamId,
}: {
  groupPoints: number;
  group: LckCupGroupName;
  onViewTeam?: (teamId: string) => void;
  table: StandingEntry[];
  userTeamId: string | undefined;
}) {
  const groupRows = table.filter((entry) => entry.lckCupGroup === group);

  return (
    <article className="competition-panel lck-cup-standings-card">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">순위표</p>
          <h2>{getLckCupGroupTitle(group)}</h2>
        </div>
        <span className="panel-note">{groupPoints}Points</span>
      </div>
      <div className="lck-cup-standings-table lck-cup-standings-header">
        <span>순위</span>
        <span>팀명</span>
        <span>경기</span>
        <span>승</span>
        <span>패</span>
        <span>세트득실</span>
      </div>
      <div className="lck-cup-standings-scroll">
        {groupRows.map((entry, index) => (
          <div
            className={`lck-cup-standings-table ${
              entry.teamId === userTeamId ? "lck-cup-standings-user" : ""
            }`}
            key={entry.teamId}
          >
            <span>{index + 1}</span>
            <TeamNameCell entry={entry} onViewTeam={onViewTeam} />
            <span>{getMatchCount(entry)}</span>
            <span>{entry.wins}</span>
            <span>{entry.losses}</span>
            <span>{getSetDiff(entry)}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function LckCupStandingsView({
  competition,
  onViewTeam,
  records,
  table,
  userTeamId,
}: {
  competition: CompetitionState;
  onViewTeam?: (teamId: string) => void;
  records: MatchRecord[];
  table: StandingEntry[];
  userTeamId: string | undefined;
}) {
  const summary = getLckCupGroupPointSummary(competition, records);

  return (
    <div className="lck-cup-standings-view">
      <div className="lck-cup-standings-grid">
        <LckCupGroupStandingsCard
          group="baron"
          groupPoints={summary.groups.baron.points}
          onViewTeam={onViewTeam}
          table={table}
          userTeamId={userTeamId}
        />
        <LckCupGroupStandingsCard
          group="elder"
          groupPoints={summary.groups.elder.points}
          onViewTeam={onViewTeam}
          table={table}
          userTeamId={userTeamId}
        />
      </div>
    </div>
  );
}

export function LckCupDashboard({
  career,
  competition,
  onSubPageChange,
  onViewCalendar,
  onViewTeam,
  records,
  subPage,
  table,
  userTeamId,
}: {
  career: CareerSave;
  competition: CompetitionState;
  onSubPageChange?: (subPage: CompetitionSubPage) => void;
  onViewCalendar?: () => void;
  onViewTeam?: (teamId: string) => void;
  records: MatchRecord[];
  subPage?: CompetitionSubPage | null;
  table: StandingEntry[];
  userTeamId: string | undefined;
}) {
  const [fallbackTab, setFallbackTab] =
    useState<LckCupDashboardTab>("standings");
  const activeTab = isLckCupDashboardTab(subPage) ? subPage : fallbackTab;
  const handleTabChange = (nextTab: LckCupDashboardTab) => {
    if (onSubPageChange) {
      onSubPageChange(nextTab);
      return;
    }

    setFallbackTab(nextTab);
  };

  return (
    <section className="competition-dashboard lck-cup-dashboard">
      <LckCupSummary
        career={career}
        competition={competition}
        onViewCalendar={onViewCalendar}
      />
      <LckCupTabs activeTab={activeTab} onTabChange={handleTabChange} />
      {activeTab === "standings" && (
        <LckCupStandingsView
          competition={competition}
          onViewTeam={onViewTeam}
          records={records}
          table={table}
          userTeamId={userTeamId}
        />
      )}
      {activeTab === "groups" && (
        <LckCupGroupPointsPanel
          competition={competition}
          onViewTeam={onViewTeam}
          records={records}
          table={table}
        />
      )}
      {activeTab === "schedule" && (
        <SchedulePanel
          competition={competition}
          records={records}
          userTeamId={userTeamId}
        />
      )}
      {activeTab === "tournament" && (
        <BracketPanel
          competition={competition}
          records={records}
          userTeamId={userTeamId}
        />
      )}
    </section>
  );
}
