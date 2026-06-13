import { useState } from "react";
import type { CompetitionSubPage } from "../../app/routes";
import type { CareerSave, CompetitionState, MatchRecord } from "../../types/game";
import { getUserTeamId } from "./competitionDashboardShared";
import { FirstStandBracketView } from "./FirstStandBracket";
import { FirstStandGroupsView } from "./FirstStandGroups";
import { FirstStandOverview } from "./FirstStandOverview";
import { FirstStandScheduleView } from "./FirstStandSchedule";
import { FirstStandSummary } from "./FirstStandSummary";
import { getFirstStandEntrants } from "./firstStandModel";

/**
 * FirstStandDashboard owns tab orchestration only.
 *
 * Keep entrant/model logic in firstStandModel.ts and route tab views through
 * FirstStandSummary, FirstStandOverview, FirstStandGroups, FirstStandSchedule,
 * and FirstStandBracket. Avoid adding new section rendering directly here.
 */
type FirstStandDashboardTab = "overview" | "groups" | "schedule" | "tournament";
function isFirstStandDashboardTab(
  value: CompetitionSubPage | null | undefined,
): value is FirstStandDashboardTab {
  return (
    value === "overview" ||
    value === "groups" ||
    value === "schedule" ||
    value === "tournament"
  );
}

function FirstStandTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: FirstStandDashboardTab;
  onTabChange: (tab: FirstStandDashboardTab) => void;
}) {
  const tabs: Array<{ id: FirstStandDashboardTab; label: string }> = [
    { id: "overview", label: "개요" },
    { id: "groups", label: "조별 순위" },
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

export function FirstStandDashboard({
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
  const [fallbackTab, setFallbackTab] =
    useState<FirstStandDashboardTab>("overview");
  const activeTab = isFirstStandDashboardTab(subPage) ? subPage : fallbackTab;
  const entrants = getFirstStandEntrants(career, competition);
  const userTeamId = getUserTeamId(competition);
  const handleTabChange = (nextTab: FirstStandDashboardTab) => {
    if (onSubPageChange) {
      onSubPageChange(nextTab);
      return;
    }

    setFallbackTab(nextTab);
  };

  return (
    <section className="competition-dashboard first-stand-dashboard">
      <FirstStandSummary
        career={career}
        competition={competition}
        entrants={entrants}
      />
      <FirstStandTabs activeTab={activeTab} onTabChange={handleTabChange} />
      {activeTab === "overview" && <FirstStandOverview entrants={entrants} />}
      {activeTab === "groups" && (
        <FirstStandGroupsView
          competition={competition}
          entrants={entrants}
          records={records}
          userTeamId={userTeamId}
        />
      )}
      {activeTab === "schedule" && (
        <FirstStandScheduleView
          competition={competition}
          entrants={entrants}
          records={records}
          userTeamId={userTeamId}
        />
      )}
      {activeTab === "tournament" && (
        <FirstStandBracketView
          competition={competition}
          records={records}
          userTeamId={userTeamId}
        />
      )}
    </section>
  );
}
