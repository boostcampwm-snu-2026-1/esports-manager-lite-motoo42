import { SeasonSummary } from "../features/season-summary";
import { useGameDispatch, useGameSelector } from "../app/GameProvider";
import type { AppRoute, RouteSubPage } from "../app/routes";
import { gameActions } from "../app/state";
import { CareerRequiredFallback } from "./CareerRequiredFallback";
import type { CompetitionId } from "../types/game";

type SeasonSummaryPageProps = {
  onGoTo: (
    route: AppRoute,
    options?: {
      competitionId?: CompetitionId | null;
      subPage?: RouteSubPage | null;
    },
  ) => void;
};

export function SeasonSummaryPage({ onGoTo }: SeasonSummaryPageProps) {
  const career = useGameSelector((state) => state.career);
  const dispatch = useGameDispatch();

  if (!career) {
    return <CareerRequiredFallback title="시즌 요약을 열 수 없습니다" />;
  }

  return (
    <SeasonSummary
      career={career}
      onStartOffseason={() => {
        dispatch(gameActions.startOffseasonMarket());
        onGoTo("offseason");
      }}
      onViewRoster={() => onGoTo("roster-builder")}
    />
  );
}
