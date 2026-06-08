import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  progressCareer,
  type CareerProgressResult,
} from "../../domain/game-progress/progressCareer";
import { isAsianGamesDecisionPending } from "../../domain/season";
import type { ProgressOverlayState } from "../../shared/layout/AppShell";
import type { CareerSave } from "../../types/game";
import { getProgressOverlayState } from "../progressOverlay";
import { getRouteForCareer, gameActions, type GameAction } from "../state";
import { getPathForRoute, getRouteMatchFromPath } from "../routes";
import { recordRouteDebugTrace } from "../routeDebugTrace";

const minimumProgressDelayMs = 5000;

export function useCareerProgressController({
  career,
  dispatch,
}: {
  career: CareerSave | null;
  dispatch: Dispatch<GameAction>;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const progressTimeoutRef = useRef<number | null>(null);
  const currentPathnameRef = useRef(location.pathname);
  const pendingProgressResultRef = useRef<CareerProgressResult | null>(null);
  const [progressOverlay, setProgressOverlay] =
    useState<ProgressOverlayState | null>(null);
  const isProgressing = progressOverlay !== null;

  useEffect(
    () => () => {
      if (progressTimeoutRef.current !== null) {
        window.clearTimeout(progressTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    currentPathnameRef.current = location.pathname;
  }, [location.pathname]);

  const handleProgress = useCallback(() => {
    if (
      isProgressing ||
      !career ||
      career.seasonState.phase === "stove-league" ||
      (career.seasonState.phase === "offseason" &&
        career.seasonState.offseason?.status !== "active") ||
      career.seasonState.phase === "completed" ||
      isAsianGamesDecisionPending(career.seasonState)
    ) {
      return;
    }

    pendingProgressResultRef.current = progressCareer(career);
    setProgressOverlay(getProgressOverlayState(career));

    progressTimeoutRef.current = window.setTimeout(() => {
      const pendingResult = pendingProgressResultRef.current;
      pendingProgressResultRef.current = null;
      progressTimeoutRef.current = null;

      if (pendingResult) {
        dispatch(gameActions.commitProgressResult(pendingResult));

        const nextRoute = getRouteForCareer(pendingResult.career);
        const targetPath = getPathForRoute(
          nextRoute,
          nextRoute === "competition-dashboard"
            ? pendingResult.career.seasonState.currentCompetitionId
            : null,
        );

        if (currentPathnameRef.current !== targetPath) {
          recordRouteDebugTrace({
            fromPath: currentPathnameRef.current,
            reason: "progress-result-route",
            source: "post-action",
            stateRoute: nextRoute,
            toPath: targetPath,
            urlRoute: getRouteMatchFromPath(currentPathnameRef.current).route,
          });
          navigate(targetPath);
        }
      }

      setProgressOverlay(null);
    }, minimumProgressDelayMs);
  }, [career, dispatch, isProgressing, navigate]);

  return {
    handleProgress,
    isProgressing,
    progressOverlay,
  };
}
