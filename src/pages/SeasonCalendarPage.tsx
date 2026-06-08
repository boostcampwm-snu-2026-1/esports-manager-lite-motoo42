import { SeasonCalendar } from "../features/season-calendar";
import {
  asianGamesSeasonCompetitions,
  normalSeasonCompetitions,
} from "../data/competitions";
import { useGameSelector } from "../app/GameProvider";
import type { AppRoute, CalendarSubPage, RouteSubPage } from "../app/routes";
import { CareerRequiredFallback } from "./CareerRequiredFallback";
import type { CompetitionId } from "../types/game";

type SeasonCalendarPageProps = {
  subPage?: CalendarSubPage | null;
  onSubPageChange?: (subPage: CalendarSubPage) => void;
  onGoTo: (
    route: AppRoute,
    options?: {
      competitionId?: CompetitionId | null;
      subPage?: RouteSubPage | null;
    },
  ) => void;
};

export function SeasonCalendarPage({
  onGoTo,
  subPage,
  onSubPageChange,
}: SeasonCalendarPageProps) {
  const career = useGameSelector((state) => state.career);

  if (!career) {
    return <CareerRequiredFallback title="시즌 캘린더를 열 수 없습니다" />;
  }

  const baseCompetitions =
    career.seasonState.calendarType === "asian-games"
      ? asianGamesSeasonCompetitions
      : normalSeasonCompetitions;
  const competitions = baseCompetitions.map((competition) => {
    const competitionState = career.seasonState.competitions.find(
      (candidate) => candidate.competitionId === competition.id,
    );

    return competitionState
      ? {
          ...competition,
          status: competitionState.status,
        }
      : competition;
  });

  return (
    <SeasonCalendar
      career={career}
      competitions={competitions}
      viewMode={subPage}
      onViewModeChange={onSubPageChange}
      onViewCompetition={(competitionId) =>
        onGoTo("competition-dashboard", { competitionId })
      }
      onViewSummary={() => onGoTo("season-summary")}
    />
  );
}
