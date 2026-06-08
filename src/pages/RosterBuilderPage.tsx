import { RosterBuilder } from "../features/roster-builder";
import { SeasonRosterManager } from "../features/roster-management";
import { useGameDispatch, useGameSelector } from "../app/GameProvider";
import type { AppRoute, RosterSubPage, RouteSubPage } from "../app/routes";
import { gameActions } from "../app/state";
import { validateFullRoster, type ContractTypeSelections } from "../domain/roster";
import { CareerRequiredFallback } from "./CareerRequiredFallback";
import type { CompetitionId } from "../types/game";

type RosterBuilderPageProps = {
  onGoTo: (
    route: AppRoute,
    options?: {
      competitionId?: CompetitionId | null;
      subPage?: RouteSubPage | null;
    },
  ) => void;
  subPage?: RosterSubPage | null;
};

export function RosterBuilderPage({ onGoTo, subPage }: RosterBuilderPageProps) {
  const career = useGameSelector((state) => state.career);
  const dispatch = useGameDispatch();

  if (!career) {
    return <CareerRequiredFallback title="로스터 화면을 열 수 없습니다" />;
  }

  const shouldShowSeasonRosterManager =
    career.seasonState.stoveLeague.status === "completed" ||
    career.seasonState.phase === "offseason";

  if (shouldShowSeasonRosterManager) {
    return (
      <SeasonRosterManager
        currentDateKey={career.seasonState.currentDateKey}
        forceEditable={career.seasonState.phase === "offseason"}
        players={career.lckPlayers}
        progressStatus={career.seasonState.progressStatus}
        subPage={subPage}
        team={career.userTeam}
        onCallUpPlayer={(playerId) => dispatch(gameActions.callUpPlayer(playerId))}
        onSendDownPlayer={(playerId) =>
          dispatch(gameActions.sendDownPlayer(playerId))
        }
        onSetStarter={(role, player) =>
          dispatch(gameActions.setRosterPlayer(role, player))
        }
      />
    );
  }

  function handleConfirmRoster(contractTypes: ContractTypeSelections) {
    if (!career) {
      return;
    }

    const validation = validateFullRoster({
      contractTypes,
      players: career.lckPlayers,
      team: career.userTeam,
    });

    if (!validation.isValid) {
      return;
    }

    dispatch(gameActions.confirmRoster(contractTypes));
    onGoTo("main-dashboard");
  }

  return (
    <RosterBuilder
      players={career.lckPlayers}
      team={career.userTeam}
      onSelectPlayer={(role, player) =>
        dispatch(gameActions.setRosterPlayer(role, player))
      }
      onSignPlayer={(player) => dispatch(gameActions.signRosterPlayer(player))}
      onReleasePlayer={(playerId) =>
        dispatch(gameActions.releaseRosterPlayer(playerId))
      }
      onConfirmRoster={handleConfirmRoster}
    />
  );
}
