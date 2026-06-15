import { useGameSelector } from "../app/GameProvider";
import type { AppRoute, RouteSubPage } from "../app/routes";
import { LiveMatchPrototype } from "../features/live-match";
import type { CompetitionId } from "../types/game";

type LiveMatchPageProps = {
  onGoTo: (
    route: AppRoute,
    options?: {
      competitionId?: CompetitionId | null;
      teamId?: string | null;
      subPage?: RouteSubPage | null;
      hash?: string | null;
    },
  ) => void;
};

export function LiveMatchPage({ onGoTo }: LiveMatchPageProps) {
  const career = useGameSelector((state) => state.career);

  return (
    <LiveMatchPrototype
      career={career}
      onExit={() => onGoTo("main-dashboard")}
    />
  );
}
