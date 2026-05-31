import { RosterBuilder } from "../features/roster-builder";
import { SeasonRosterManager } from "../features/roster-management";
import { useGame } from "../app/GameProvider";

export function RosterBuilderPage() {
  const { state, dispatch } = useGame();

  if (!state.career) {
    return null;
  }

  if (state.career.seasonState.stoveLeague.status === "completed") {
    return (
      <SeasonRosterManager
        currentDateKey={state.career.seasonState.currentDateKey}
        players={state.career.lckPlayers}
        progressStatus={state.career.seasonState.progressStatus}
        team={state.career.userTeam}
        onSetStarter={(role, player) =>
          dispatch({ type: "set-roster-player", role, player })
        }
      />
    );
  }

  return (
    <RosterBuilder
      players={state.career.lckPlayers}
      team={state.career.userTeam}
      onSelectPlayer={(role, player) =>
        dispatch({ type: "set-roster-player", role, player })
      }
      onSignPlayer={(player) => dispatch({ type: "sign-roster-player", player })}
      onReleasePlayer={(playerId) =>
        dispatch({ type: "release-roster-player", playerId })
      }
      onConfirmRoster={(contractTypes) =>
        dispatch({ type: "confirm-roster", contractTypes })
      }
    />
  );
}
