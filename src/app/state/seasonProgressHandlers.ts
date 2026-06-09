import {
  progressCareer,
  simulatePracticeMatch,
} from "../../domain/game-progress/progressCareer";
import { setAsianGamesPlayMode } from "../../domain/season";
import type { GameAction } from "./gameActions";
import type { GameState } from "./gameState";
import { commitProgressResult } from "./routeSelectors";

type SeasonProgressAction = Extract<
  GameAction,
  {
    type:
      | "set-asian-games-play-mode"
      | "simulate-next-match"
      | "progress-season"
      | "commit-progress-result";
  }
>;

export function handleSeasonProgressAction(
  state: GameState,
  action: SeasonProgressAction,
): GameState {
  if (action.type === "commit-progress-result") {
    return commitProgressResult(state, action.result);
  }

  if (!state.career) {
    return state;
  }

  if (action.type === "set-asian-games-play-mode") {
    return {
      ...state,
      route: "competition-dashboard",
      selectedCompetitionId: "asian-games",
      career: {
        ...state.career,
        seasonState: setAsianGamesPlayMode(
          state.career.seasonState,
          action.playMode,
        ),
      },
    };
  }

  if (action.type === "progress-season") {
    return commitProgressResult(state, progressCareer(state.career));
  }

  return {
    ...state,
    ...simulatePracticeMatch(state.career),
  };
}
