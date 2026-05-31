import { SeasonSummary } from "../features/season-summary";
import { useGame } from "../app/GameProvider";

export function SeasonSummaryPage() {
  const { state, dispatch } = useGame();

  if (!state.career) {
    return null;
  }

  return (
    <SeasonSummary
      team={state.career.userTeam}
      onBackToRoster={() => dispatch({ type: "go-to", route: "roster-builder" })}
    />
  );
}
