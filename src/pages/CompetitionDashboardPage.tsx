import { useGame } from "../app/GameProvider";
import { CompetitionDashboard } from "../features/competition-dashboard";

export function CompetitionDashboardPage() {
  const { state } = useGame();

  if (!state.career) {
    return null;
  }

  return (
    <CompetitionDashboard
      career={state.career}
      competitionId={state.selectedCompetitionId}
    />
  );
}
