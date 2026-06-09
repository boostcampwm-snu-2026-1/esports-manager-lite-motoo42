import type { GameAction } from "./gameActions";
import type { GameState } from "./gameState";
import { getSelectedCompetitionIdForRoute } from "./routeSelectors";

type RouteAction = Extract<
  GameAction,
  { type: "go-to" | "sync-route" | "view-competition" }
>;

export function handleRouteAction(
  state: GameState,
  action: RouteAction,
): GameState {
  if (action.type === "sync-route") {
    return {
      ...state,
      route: action.route,
      selectedCompetitionId: getSelectedCompetitionIdForRoute(
        state,
        action.route,
        action.competitionId,
      ),
    };
  }

  if (action.type === "go-to") {
    return {
      ...state,
      route: action.route,
      selectedCompetitionId: getSelectedCompetitionIdForRoute(
        state,
        action.route,
      ),
    };
  }

  return {
    ...state,
    route: "competition-dashboard",
    selectedCompetitionId: getSelectedCompetitionIdForRoute(
      state,
      "competition-dashboard",
      action.competitionId,
    ),
  };
}
