import type { AppRoute } from "./routes";

export type RouteDebugTraceEntry = {
  fromPath: string;
  reason: string;
  source: "navigation" | "route-sync" | "post-action";
  stateRoute: AppRoute;
  timestamp: number;
  toPath: string;
  urlRoute: AppRoute;
};

const maxRouteTraceEntries = 30;
const routeDebugTraceEntries: RouteDebugTraceEntry[] = [];

export function recordRouteDebugTrace(entry: Omit<RouteDebugTraceEntry, "timestamp">) {
  routeDebugTraceEntries.push({
    ...entry,
    timestamp: Date.now(),
  });

  if (routeDebugTraceEntries.length > maxRouteTraceEntries) {
    routeDebugTraceEntries.splice(
      0,
      routeDebugTraceEntries.length - maxRouteTraceEntries,
    );
  }
}

export function getRouteDebugTrace() {
  return [...routeDebugTraceEntries];
}

export function clearRouteDebugTrace() {
  routeDebugTraceEntries.length = 0;
}
