import { createInitialCareer } from "../../domain/career/createInitialCareer";
import { createInitialCareerMessages } from "../../domain/messages";
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
    const career = createInitialCareerMessages(
      createInitialCareer(action.teamName, { startMode: action.startMode }),
    );

    return {
      ...state,
      career,
      route:
        action.startMode === "real-roster-lck-cup"
          ? "main-dashboard"
          : "offseason",
      lastMatch: null,
      selectedCompetitionId:
        action.startMode === "real-roster-lck-cup"
          ? career.seasonState.currentCompetitionId
          : null,
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
