import { useCallback, type Dispatch } from "react";
import { useNavigate } from "react-router-dom";
import { isAsianGamesDecisionPending } from "../../domain/season";
import type { CareerSave } from "../../types/game";
import { getPathForRoute } from "../routes";
import { gameActions, type GameAction } from "../state";

export function useAsianGamesDecision({
  career,
  dispatch,
}: {
  career: CareerSave | null;
  dispatch: Dispatch<GameAction>;
}) {
  const navigate = useNavigate();
  const asianGamesDecisionState =
    career && isAsianGamesDecisionPending(career.seasonState)
      ? career.seasonState.asianGames ?? null
      : null;

  const handleSelectAuto = useCallback(() => {
    dispatch(gameActions.setAsianGamesPlayMode("auto"));
    navigate(getPathForRoute("competition-dashboard", "asian-games"));
  }, [dispatch, navigate]);

  const handleSelectManual = useCallback(() => {
    dispatch(gameActions.setAsianGamesPlayMode("manual"));
    navigate(getPathForRoute("competition-dashboard", "asian-games"));
  }, [dispatch, navigate]);

  return {
    asianGamesDecisionState,
    handleSelectAuto,
    handleSelectManual,
  };
}
