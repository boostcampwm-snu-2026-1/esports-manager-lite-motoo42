import type { ReactNode } from "react";
import { CareerSetupPage } from "../pages/CareerSetupPage";
import { CompetitionDashboardPage } from "../pages/CompetitionDashboardPage";
import { MainDashboardPage } from "../pages/MainDashboardPage";
import { MatchWeekPage } from "../pages/MatchWeekPage";
import { OffseasonPage } from "../pages/OffseasonPage";
import { RosterBuilderPage } from "../pages/RosterBuilderPage";
import { SaveManagerPage } from "../pages/SaveManagerPage";
import { SeasonCalendarPage } from "../pages/SeasonCalendarPage";
import { SeasonSummaryPage } from "../pages/SeasonSummaryPage";
import type {
  AppRoute,
  CalendarSubPage,
  CompetitionSubPage,
  RosterSubPage,
  RouteSubPage,
} from "./routes";
import type { CompetitionId } from "../types/game";

type AppRouteRendererProps = {
  calendarSubPage?: CalendarSubPage | null;
  competitionId?: CompetitionId | null;
  competitionSubPage?: CompetitionSubPage | null;
  rosterSubPage?: RosterSubPage | null;
  onCalendarSubPageChange: (subPage: CalendarSubPage) => void;
  onCompetitionSubPageChange: (subPage: CompetitionSubPage) => void;
  onGoTo: (
    route: AppRoute,
    options?: {
      competitionId?: CompetitionId | null;
      subPage?: RouteSubPage | null;
    },
  ) => void;
  route: AppRoute;
  savePanel?: ReactNode;
};

export function AppRouteRenderer({
  calendarSubPage,
  competitionId,
  competitionSubPage,
  rosterSubPage,
  onCalendarSubPageChange,
  onCompetitionSubPageChange,
  onGoTo,
  route,
  savePanel,
}: AppRouteRendererProps) {
  if (route === "career-setup") {
    return <CareerSetupPage savePanel={savePanel} />;
  }

  if (route === "roster-builder") {
    return <RosterBuilderPage onGoTo={onGoTo} subPage={rosterSubPage} />;
  }

  if (route === "main-dashboard") {
    return <MainDashboardPage onGoTo={onGoTo} />;
  }

  if (route === "match-week") {
    return <MatchWeekPage onGoTo={onGoTo} />;
  }

  if (route === "competition-dashboard") {
    return (
      <CompetitionDashboardPage
        competitionId={competitionId}
        subPage={competitionSubPage}
        onSubPageChange={onCompetitionSubPageChange}
      />
    );
  }

  if (route === "season-calendar") {
    return (
      <SeasonCalendarPage
        subPage={calendarSubPage}
        onSubPageChange={onCalendarSubPageChange}
        onGoTo={onGoTo}
      />
    );
  }

  if (route === "offseason") {
    return <OffseasonPage onGoTo={onGoTo} />;
  }

  if (route === "save-manager") {
    return <SaveManagerPage savePanel={savePanel} />;
  }

  return <SeasonSummaryPage onGoTo={onGoTo} />;
}
