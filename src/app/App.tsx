import { CareerSetupPage } from "../pages/CareerSetupPage";
import { MainDashboardPage } from "../pages/MainDashboardPage";
import { MatchWeekPage } from "../pages/MatchWeekPage";
import { CompetitionDashboardPage } from "../pages/CompetitionDashboardPage";
import { RosterBuilderPage } from "../pages/RosterBuilderPage";
import { SeasonCalendarPage } from "../pages/SeasonCalendarPage";
import { SeasonSummaryPage } from "../pages/SeasonSummaryPage";
import { AppShell } from "../shared/layout/AppShell";
import { GameProvider, useGame } from "./GameProvider";

function AppContent() {
  const { state, dispatch } = useGame();

  return (
    <AppShell
      career={state.career}
      route={state.route}
      onGoTo={(route) => dispatch({ type: "go-to", route })}
      onProgress={() => dispatch({ type: "progress-season" })}
    >
      {state.route === "career-setup" && <CareerSetupPage />}
      {state.route === "roster-builder" && <RosterBuilderPage />}
      {state.route === "main-dashboard" && <MainDashboardPage />}
      {state.route === "match-week" && <MatchWeekPage />}
      {state.route === "competition-dashboard" && <CompetitionDashboardPage />}
      {state.route === "season-calendar" && <SeasonCalendarPage />}
      {state.route === "season-summary" && <SeasonSummaryPage />}
    </AppShell>
  );
}

export function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
