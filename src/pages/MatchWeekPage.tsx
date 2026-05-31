import { MatchWeek } from "../features/match-week";
import { useGame } from "../app/GameProvider";

export function MatchWeekPage() {
  const { state, dispatch } = useGame();

  if (!state.career) {
    return null;
  }

  return (
    <MatchWeek
      opponent={state.career.internationalOpponents[0]}
      result={state.lastMatch}
      weeklyPlan={state.career.weeklyPlan}
      onStrategyChange={(strategy) =>
        dispatch({ type: "set-strategy", strategy })
      }
      onTrainingIntensityChange={(trainingIntensity) =>
        dispatch({ type: "set-training-intensity", trainingIntensity })
      }
      onSimulate={() => dispatch({ type: "simulate-next-match" })}
      onViewCalendar={() => dispatch({ type: "go-to", route: "season-calendar" })}
    />
  );
}
