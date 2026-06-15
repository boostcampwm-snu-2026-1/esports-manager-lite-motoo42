import {
  useEffect,
  useMemo,
  type Dispatch,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getPathForRoute,
  getRouteMatchFromPath,
  type AppRoute,
  type RouteMatch,
} from "../routes";
import type { CareerSave, CompetitionId } from "../../types/game";
import { gameActions, type GameAction } from "../state";
import { recordRouteDebugTrace } from "../routeDebugTrace";

function getDisplayRouteMatch({
  career,
  pathname,
  routeMatch,
}: {
  career: CareerSave | null;
  pathname: string;
  routeMatch: RouteMatch;
}): RouteMatch {
  if (!career) {
    return routeMatch.route === "career-setup" || routeMatch.route === "live-match"
      ? routeMatch
      : { route: "career-setup" };
  }

  if (pathname === "/") {
    return { route: "main-dashboard" };
  }

  if (routeMatch.route === "career-setup" && pathname !== "/") {
    return { route: "main-dashboard" };
  }

  return routeMatch;
}

export function useRouteSynchronization({
  career,
  dispatch,
  route,
  selectedCompetitionId,
}: {
  career: CareerSave | null;
  dispatch: Dispatch<GameAction>;
  route: AppRoute;
  selectedCompetitionId: CompetitionId | null;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const routeMatch = useMemo(
    () => getRouteMatchFromPath(location.pathname),
    [location.pathname],
  );
  const displayRouteMatch = useMemo(
    () =>
      getDisplayRouteMatch({
        career,
        pathname: location.pathname,
        routeMatch,
      }),
    [career, location.pathname, routeMatch],
  );

  useEffect(() => {
    const isUnknownPath =
      routeMatch.route === "career-setup" && location.pathname !== "/";

    if (!career && location.pathname !== "/" && routeMatch.route !== "live-match") {
      recordRouteDebugTrace({
        fromPath: location.pathname,
        reason: "protected-route-without-career",
        source: "route-sync",
        stateRoute: route,
        toPath: "/",
        urlRoute: routeMatch.route,
      });
      navigate("/", { replace: true });
      return;
    }

    if (career && (isUnknownPath || location.pathname === "/")) {
      const targetPath = getPathForRoute("main-dashboard");

      recordRouteDebugTrace({
        fromPath: location.pathname,
        reason: isUnknownPath ? "unknown-path-with-career" : "root-with-career",
        source: "route-sync",
        stateRoute: route,
        toPath: targetPath,
        urlRoute: routeMatch.route,
      });
      navigate(targetPath, { replace: true });
      return;
    }

    const nextSelectedCompetitionId =
      routeMatch.route === "competition-dashboard"
        ? routeMatch.competitionId ??
          career?.seasonState.currentCompetitionId ??
          selectedCompetitionId ??
          null
        : selectedCompetitionId;

    if (
      route !== routeMatch.route ||
      (routeMatch.route === "competition-dashboard" &&
        selectedCompetitionId !== nextSelectedCompetitionId)
    ) {
      dispatch(
        gameActions.syncRoute(routeMatch.route, routeMatch.competitionId),
      );
    }
  }, [
    dispatch,
    location.pathname,
    navigate,
    routeMatch.competitionId,
    routeMatch.route,
    career,
    route,
    selectedCompetitionId,
  ]);

  return displayRouteMatch;
}
