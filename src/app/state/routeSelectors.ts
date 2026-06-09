import type {
  CareerProgressResult,
} from "../../domain/game-progress/progressCareer";
import type { CareerSave, CompetitionId } from "../../types/game";
import type { AppRoute } from "../routes";
import type { GameState } from "./gameState";

export function getSelectedCompetitionIdForRoute(
  state: GameState,
  route: AppRoute,
  competitionId?: CompetitionId | null,
) {
  if (route !== "competition-dashboard") {
    return state.selectedCompetitionId;
  }

  return (
    competitionId ??
    state.career?.seasonState.currentCompetitionId ??
    state.selectedCompetitionId ??
    null
  );
}

export function getRouteForCareer(career: CareerSave): AppRoute {
  if (career.seasonState.phase === "completed") {
    return "season-summary";
  }

  if (career.seasonState.phase === "offseason") {
    const offseasonStatus = career.seasonState.offseason?.status;

    return offseasonStatus === "active" || offseasonStatus === "ready-for-next-season"
      ? "offseason"
      : "season-summary";
  }

  return "main-dashboard";
}

export function commitProgressResult(
  state: GameState,
  result: CareerProgressResult,
): GameState {
  return {
    ...state,
    route: getRouteForCareer(result.career),
    career: result.career,
    lastMatch: result.lastMatch,
    selectedCompetitionId: result.career.seasonState.currentCompetitionId,
  };
}
