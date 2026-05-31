import { useGame } from "../app/GameProvider";
import { MainDashboard } from "../features/main-dashboard";

export function MainDashboardPage() {
  const { state, dispatch } = useGame();

  if (!state.career) {
    return null;
  }

  return (
    <MainDashboard
      career={state.career}
      onViewRoster={() => dispatch({ type: "go-to", route: "roster-builder" })}
      onViewCompetition={() =>
        dispatch({ type: "go-to", route: "competition-dashboard" })
      }
      onViewCalendar={() => dispatch({ type: "go-to", route: "season-calendar" })}
    />
  );
}
