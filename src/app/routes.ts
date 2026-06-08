import type { CompetitionId } from "../types/game";

export type AppRoute =
  | "career-setup"
  | "roster-builder"
  | "main-dashboard"
  | "match-week"
  | "competition-dashboard"
  | "season-calendar"
  | "save-manager"
  | "offseason"
  | "season-summary";

export type CompetitionSubPage =
  | "overview"
  | "groups"
  | "standings"
  | "schedule"
  | "tournament"
  | "bracket";

export type CalendarSubPage = "roadmap" | "calendar";

export type RosterSubPage = "main" | "academy" | "contracts";

export type RouteSubPage = CompetitionSubPage | CalendarSubPage | RosterSubPage;

export const appRoutes: AppRoute[] = [
  "career-setup",
  "roster-builder",
  "main-dashboard",
  "match-week",
  "competition-dashboard",
  "season-calendar",
  "save-manager",
  "offseason",
  "season-summary",
];

const routePathByRoute: Record<AppRoute, string> = {
  "career-setup": "/",
  "roster-builder": "/roster",
  "main-dashboard": "/hub",
  "match-week": "/match",
  "competition-dashboard": "/competitions",
  "season-calendar": "/calendar",
  "save-manager": "/saves",
  offseason: "/offseason",
  "season-summary": "/summary",
};

const competitionIds = new Set<CompetitionId>([
  "lck-cup",
  "first-stand",
  "lck-rounds-1-2",
  "msi",
  "lck-rounds-3-5",
  "lck-rounds-3-4",
  "worlds",
  "asian-games",
]);

const competitionSubPages = new Set<CompetitionSubPage>([
  "overview",
  "groups",
  "standings",
  "schedule",
  "tournament",
  "bracket",
]);

const calendarSubPages = new Set<CalendarSubPage>(["roadmap", "calendar"]);
const rosterSubPages = new Set<RosterSubPage>(["main", "academy", "contracts"]);

export type RouteMatch = {
  route: AppRoute;
  competitionId?: CompetitionId | null;
  competitionSubPage?: CompetitionSubPage | null;
  calendarSubPage?: CalendarSubPage | null;
  rosterSubPage?: RosterSubPage | null;
};

export function isCompetitionId(value: string): value is CompetitionId {
  return competitionIds.has(value as CompetitionId);
}

export function isCompetitionSubPage(
  value: string,
): value is CompetitionSubPage {
  return competitionSubPages.has(value as CompetitionSubPage);
}

export function isCalendarSubPage(value: string): value is CalendarSubPage {
  return calendarSubPages.has(value as CalendarSubPage);
}

export function isRosterSubPage(value: string): value is RosterSubPage {
  return rosterSubPages.has(value as RosterSubPage);
}

export function getPathForRoute(
  route: AppRoute,
  competitionId?: CompetitionId | null,
  subPage?: RouteSubPage | null,
) {
  if (route === "competition-dashboard" && competitionId) {
    if (subPage && isCompetitionSubPage(subPage)) {
      return `/competitions/${competitionId}/${subPage}`;
    }

    return `/competitions/${competitionId}`;
  }

  if (route === "season-calendar") {
    if (subPage && isCalendarSubPage(subPage)) {
      return `/calendar/${subPage}`;
    }

    return routePathByRoute[route];
  }

  if (route === "roster-builder") {
    if (subPage && isRosterSubPage(subPage)) {
      return `/roster/${subPage}`;
    }

    return routePathByRoute[route];
  }

  return routePathByRoute[route];
}

export function getRouteMatchFromPath(pathname: string): RouteMatch {
  if (pathname === "/roster") {
    return { route: "roster-builder", rosterSubPage: null };
  }

  const rosterMatch = pathname.match(/^\/roster\/([^/]+)$/);

  if (rosterMatch) {
    return {
      route: "roster-builder",
      rosterSubPage: isRosterSubPage(rosterMatch[1]) ? rosterMatch[1] : null,
    };
  }

  if (pathname === "/hub") {
    return { route: "main-dashboard" };
  }

  if (pathname === "/match") {
    return { route: "match-week" };
  }

  if (pathname === "/calendar") {
    return { route: "season-calendar", calendarSubPage: null };
  }

  if (pathname === "/saves") {
    return { route: "save-manager" };
  }

  const calendarMatch = pathname.match(/^\/calendar\/([^/]+)$/);

  if (calendarMatch) {
    return {
      route: "season-calendar",
      calendarSubPage: isCalendarSubPage(calendarMatch[1])
        ? calendarMatch[1]
        : null,
    };
  }

  if (pathname === "/summary") {
    return { route: "season-summary" };
  }

  if (pathname === "/offseason") {
    return { route: "offseason" };
  }

  if (pathname === "/competitions") {
    return { route: "competition-dashboard", competitionId: null };
  }

  const competitionMatch = pathname.match(/^\/competitions\/([^/]+)(?:\/([^/]+))?$/);

  if (competitionMatch && isCompetitionId(competitionMatch[1])) {
    const subPage = competitionMatch[2];

    return {
      route: "competition-dashboard",
      competitionId: competitionMatch[1],
      competitionSubPage:
        subPage && isCompetitionSubPage(subPage) ? subPage : null,
    };
  }

  return { route: "career-setup" };
}
