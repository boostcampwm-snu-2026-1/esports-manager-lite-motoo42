import { createInitialCareer } from "../../domain/career/createInitialCareer";
import type { GameAction } from "./gameActions";
import type { GameState } from "./gameState";
import { getRouteForCareer } from "./routeSelectors";

type CareerAction = Extract<
  GameAction,
  { type: "start-career" | "load-career" }
>;

export function handleCareerAction(
  state: GameState,
  action: CareerAction,
): GameState {
  if (action.type === "start-career") {
    return {
      ...state,
      career: createInitialCareer(action.teamName),
      route: "offseason",
      lastMatch: null,
      selectedCompetitionId: null,
    };
  }

  return {
    ...state,
    career: action.career,
    route: getRouteForCareer(action.career),
    lastMatch: null,
    selectedCompetitionId: action.career.seasonState.currentCompetitionId,
  };
}
