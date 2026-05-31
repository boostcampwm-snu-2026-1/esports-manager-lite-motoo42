import { SeasonCalendar } from "../features/season-calendar";
import {
  asianGamesSeasonCompetitions,
  normalSeasonCompetitions,
} from "../data/competitions";
import { useGame } from "../app/GameProvider";

export function SeasonCalendarPage() {
  const { state, dispatch } = useGame();

  if (!state.career) {
    return null;
  }

  const { career } = state;
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
      onViewCompetition={(competitionId) =>
        dispatch({ type: "view-competition", competitionId })
      }
      onViewSummary={() => dispatch({ type: "go-to", route: "season-summary" })}
    />
  );
}
