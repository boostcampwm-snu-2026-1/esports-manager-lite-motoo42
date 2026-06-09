import type { GameAction } from "./gameActions";
import type { GameState } from "./gameState";

type WeeklyPlanAction = Extract<
  GameAction,
  { type: "set-strategy" | "set-training-intensity" }
>;

export function handleWeeklyPlanAction(
  state: GameState,
  action: WeeklyPlanAction,
): GameState {
  if (!state.career) {
    return state;
  }

  if (action.type === "set-strategy") {
    return {
      ...state,
      career: {
        ...state.career,
        weeklyPlan: {
          ...state.career.weeklyPlan,
          strategy: action.strategy,
        },
      },
    };
  }

  return {
    ...state,
    career: {
      ...state.career,
      weeklyPlan: {
        ...state.career.weeklyPlan,
        trainingIntensity: action.trainingIntensity,
      },
    },
  };
}
