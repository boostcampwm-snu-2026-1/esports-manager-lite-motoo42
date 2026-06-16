import type { CompetitionSubPage } from "../../app/routes";
import type { CareerSave, CompetitionId } from "../../types/game";
import { AsianGamesDashboard } from "./AsianGamesDashboard";
import { FirstStandDashboard } from "./FirstStandDashboard";
import { LckCupDashboard, LckRoundsDashboard } from "./LckDashboard";
import { MsiDashboard } from "./MsiDashboard";
import { WorldsDashboard } from "./WorldsDashboard";
import {
  BracketPanel,
  CompetitionListView,
  CompetitionSummary,
  GroupStatusPanel,
  SchedulePanel,
  StandingsTable,
  getCurrentCompetition,
  getSortedTable,
  getUserTeamId,
  isLckRoundsDashboardCompetition,
} from "./competitionDashboardShared";

type CompetitionDashboardProps = {
  career: CareerSave;
  competitionId?: CompetitionId | null;
  subPage?: CompetitionSubPage | null;
  onSubPageChange?: (subPage: CompetitionSubPage) => void;
  onSelectCompetition?: (competitionId: CompetitionId) => void;
  onViewCalendar?: () => void;
  onViewTeam?: (teamId: string) => void;
};

export function CompetitionDashboard({
  career,
  competitionId,
  onViewCalendar,
  onSelectCompetition,
  subPage,
  onSubPageChange,
  onViewTeam,
}: CompetitionDashboardProps) {
  if (competitionId === null) {
    return (
      <CompetitionListView
        career={career}
        onSelectCompetition={onSelectCompetition}
      />
    );
  }

  const competition = getCurrentCompetition(career, competitionId);

  if (!competition) {
    return (
      <section className="competition-dashboard">
        <section className="competition-panel">
          <p className="eyebrow">Competition</p>
          <h1>?? ?? ?? ??</h1>
          <p className="muted">?????? ??? LCK Cup ??? ?????.</p>
        </section>
      </section>
    );
  }

  const records = career.seasonState.matchRecords;
  const userTeamId = getUserTeamId(competition);
  const table = getSortedTable(competition, records);

  if (competition.competitionId === "lck-cup") {
    return (
      <LckCupDashboard
        career={career}
        competition={competition}
        onSubPageChange={onSubPageChange}
        onViewCalendar={onViewCalendar}
        onViewTeam={onViewTeam}
        records={records}
        subPage={subPage}
        table={table}
        userTeamId={userTeamId}
      />
    );
  }

  if (isLckRoundsDashboardCompetition(competition)) {
    return (
      <LckRoundsDashboard
        career={career}
        competition={competition}
        subPage={subPage}
        onSubPageChange={onSubPageChange}
        onViewTeam={onViewTeam}
        records={records}
        table={table}
        userTeamId={userTeamId}
      />
    );
  }

  if (competition.competitionId === "first-stand") {
    return (
      <FirstStandDashboard
        career={career}
        competition={competition}
        subPage={subPage}
        onSubPageChange={onSubPageChange}
        records={records}
      />
    );
  }

  if (competition.competitionId === "msi") {
    return (
      <MsiDashboard
        career={career}
        competition={competition}
        subPage={subPage}
        onSubPageChange={onSubPageChange}
        records={records}
      />
    );
  }

  if (competition.competitionId === "asian-games") {
    return (
      <AsianGamesDashboard
        career={career}
        competition={competition}
        subPage={subPage}
        onSubPageChange={onSubPageChange}
        records={records}
      />
    );
  }

  if (competition.competitionId === "worlds") {
    return (
      <WorldsDashboard
        career={career}
        competition={competition}
        subPage={subPage}
        onSubPageChange={onSubPageChange}
        records={records}
      />
    );
  }

  return (
    <section className="competition-dashboard">
      <CompetitionSummary
        career={career}
        competition={competition}
        userTeamId={userTeamId}
      />
      <div className="competition-overview-grid">
        <StandingsTable
          onViewTeam={onViewTeam}
          table={table}
          userTeamId={userTeamId}
        />
        <GroupStatusPanel
          competition={competition}
          records={records}
          table={table}
        />
      </div>
      <SchedulePanel
        competition={competition}
        records={records}
        userTeamId={userTeamId}
      />
      <BracketPanel
        competition={competition}
        records={records}
        userTeamId={userTeamId}
      />
    </section>
  );
}
