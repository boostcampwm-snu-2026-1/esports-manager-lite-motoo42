import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { championPool } from "../domain/champions";
import { createInitialCareer } from "../domain/career/createInitialCareer";
import {
  createOpponentDraftPlayers,
  getRosterPlayersByRole,
  mapOpponentStyleToStrategy,
  runSimpleDraft,
} from "../domain/draft";
import { simulateMatch } from "../domain/match-simulation";
import {
  createLckOpponentFromSchedule,
  getLckTeamStrength,
} from "../domain/opponents";
import {
  applyCallUpMoraleBoost,
  applyWeeklyPlayerStatusChanges,
} from "../domain/player-status";
import {
  createContractsForRoster,
  getSelectedRosterPlayerIds,
  splitRosterByStarter,
  validateFullRoster,
  type ContractTypeSelections,
} from "../domain/roster";
import {
  advanceToNextDay,
  advanceLckCupAfterCompletedWeek,
  completeLckRounds12IfFinished,
  completeStoveLeague,
  continueAfterMatchReview,
  getCurrentDateScheduledMatches,
  recordCompletedMatches,
  transitionFromLckCupToLckRounds12,
} from "../domain/season";
import { createSeededRandom } from "../domain/rng/createSeededRandom";
import { simulateSeries } from "../domain/series";
import type { AppRoute } from "./routes";
import type {
  CareerSave,
  CompetitionId,
  MatchRecord,
  MatchResult,
  MatchSchedule,
  Player,
  Role,
  SeasonState,
  StrategyId,
  TrainingIntensity,
} from "../types/game";

type GameState = {
  route: AppRoute;
  career: CareerSave | null;
  lastMatch: MatchResult | null;
  selectedCompetitionId: CompetitionId | null;
};

type GameAction =
  | { type: "start-career"; teamName: string }
  | { type: "go-to"; route: AppRoute }
  | { type: "view-competition"; competitionId?: CompetitionId | null }
  | { type: "sign-roster-player"; player: Player }
  | { type: "release-roster-player"; playerId: string }
  | { type: "set-roster-player"; role: Role; player: Player | null }
  | { type: "confirm-roster"; contractTypes: ContractTypeSelections }
  | { type: "set-strategy"; strategy: StrategyId }
  | { type: "set-training-intensity"; trainingIntensity: TrainingIntensity }
  | { type: "simulate-next-match" }
  | { type: "progress-season" };

type GameContextValue = {
  state: GameState;
  dispatch: Dispatch<GameAction>;
};

const GameContext = createContext<GameContextValue | null>(null);

const initialState: GameState = {
  route: "career-setup",
  career: null,
  lastMatch: null,
  selectedCompetitionId: null,
};

function getUserTeamId(seasonState: SeasonState) {
  const activeCompetition = seasonState.competitions.find(
    (competition) => competition.competitionId === seasonState.currentCompetitionId,
  );

  return (
    activeCompetition?.standings.find((entry) => entry.isUserTeam)?.teamId ??
    "user-team"
  );
}

function toWinProbability(blueStrength: number, redStrength: number) {
  const blueElo = 1200 + blueStrength * 7;
  const redElo = 1200 + redStrength * 7;

  return 1 / (1 + 10 ** ((redElo - blueElo) / 400));
}

function getWinsNeeded(format: MatchSchedule["format"]) {
  if (format === "bo5") {
    return 3;
  }

  if (format === "bo3") {
    return 2;
  }

  return 1;
}

function createMatchRecordFromSchedule({
  career,
  match,
  matchIndex,
}: {
  career: CareerSave;
  match: MatchSchedule;
  matchIndex: number;
}): { record: MatchRecord; lastMatchResult: MatchResult } {
  const userTeamId = getUserTeamId(career.seasonState);
  const userIsBlue = match.blueTeamId === userTeamId;
  const opponent = createLckOpponentFromSchedule(match, userTeamId);
  const series = simulateSeries({
    team: career.userTeam,
    players: career.lckPlayers,
    opponent,
    strategy: career.weeklyPlan.strategy,
    trainingIntensity: career.weeklyPlan.trainingIntensity,
    seed: `season-${career.currentSeason}-${match.id}-${career.seasonState.currentTurn}`,
    format: match.format,
    fearlessEnabled: match.fearlessEnabled,
  });
  const winnerSide =
    series.winner === "user"
      ? userIsBlue
        ? "blue"
        : "red"
      : userIsBlue
        ? "red"
        : "blue";
  const score = userIsBlue
    ? {
        blueWins: series.userWins,
        redWins: series.opponentWins,
      }
    : {
        blueWins: series.opponentWins,
        redWins: series.userWins,
      };
  const lastGame = series.games[series.games.length - 1];
  const winProbability =
    series.games.reduce(
      (total, game) => total + game.result.winProbability,
      0,
    ) / series.games.length;

  return {
    lastMatchResult: lastGame.result,
    record: {
      id: `${match.id}-record-${career.seasonState.currentTurn + 1}-${matchIndex + 1}`,
      scheduleId: match.id,
      competitionId: match.competitionId,
      week: match.week,
      stageName: match.stageName,
      winnerSide,
      winnerTeamId: winnerSide === "blue" ? match.blueTeamId : match.redTeamId,
      winnerTeamName:
        winnerSide === "blue" ? match.blueTeamName : match.redTeamName,
      score,
      userResult: series.winner === "user" ? "win" : "loss",
      winProbability,
      draft: lastGame.result.draft,
      log: [
        `${match.blueTeamName} ${score.blueWins}-${score.redWins} ${match.redTeamName}`,
        ...series.games.flatMap((game) => [
          `Game ${game.gameNumber}: ${game.result.winner === "user" ? "Win" : "Loss"}`,
          ...game.result.log,
        ]),
      ],
      createdAtTurn: career.seasonState.currentTurn + 1,
    },
  };
}

function createNeutralMatchRecordFromSchedule({
  career,
  match,
  matchIndex,
}: {
  career: CareerSave;
  match: MatchSchedule;
  matchIndex: number;
}): MatchRecord {
  const random = createSeededRandom(
    `season-${career.currentSeason}-${match.id}-${career.seasonState.currentTurn}`,
  );
  const winsNeeded = getWinsNeeded(match.format);
  const blueStrength = getLckTeamStrength(match.blueTeamId);
  const redStrength = getLckTeamStrength(match.redTeamId);
  const blueWinProbability = toWinProbability(blueStrength, redStrength);
  let blueWins = 0;
  let redWins = 0;

  while (blueWins < winsNeeded && redWins < winsNeeded) {
    if (random() <= blueWinProbability) {
      blueWins += 1;
    } else {
      redWins += 1;
    }
  }

  const winnerSide = blueWins > redWins ? "blue" : "red";

  return {
    id: `${match.id}-record-${career.seasonState.currentTurn + 1}-${matchIndex + 1}`,
    scheduleId: match.id,
    competitionId: match.competitionId,
    week: match.week,
    stageName: match.stageName,
    winnerSide,
    winnerTeamId: winnerSide === "blue" ? match.blueTeamId : match.redTeamId,
    winnerTeamName:
      winnerSide === "blue" ? match.blueTeamName : match.redTeamName,
    score: {
      blueWins,
      redWins,
    },
    userResult: "none",
    winProbability: blueWinProbability,
    log: [
      `${match.blueTeamName} ${blueWins}-${redWins} ${match.redTeamName}`,
      `Neutral simulation: ${match.format.toUpperCase()} ${match.stageName}.`,
      `Blue-side win chance: ${Math.round(blueWinProbability * 100)}%.`,
    ],
    createdAtTurn: career.seasonState.currentTurn + 1,
  };
}

function isWeekFullyCompleted(
  seasonState: SeasonState,
  competitionId: CompetitionId,
  week: number,
) {
  const weekMatches = seasonState.scheduledMatches.filter(
    (match) => match.competitionId === competitionId && match.week === week,
  );

  return (
    weekMatches.length > 0 &&
    weekMatches.every((match) => match.status === "completed")
  );
}

function advanceCompetitionsAfterCompletedRecords(
  seasonState: SeasonState,
  records: MatchRecord[],
) {
  const seasonStateAfterCupAdvance = [...new Set(records.map((record) => record.week))].reduce(
    (currentSeasonState, week) => {
      if (
        records.some((record) => record.competitionId === "lck-cup") &&
        isWeekFullyCompleted(currentSeasonState, "lck-cup", week)
      ) {
        return advanceLckCupAfterCompletedWeek(currentSeasonState, week);
      }

      return currentSeasonState;
    },
    seasonState,
  );

  if (records.some((record) => record.competitionId === "lck-rounds-1-2")) {
    return completeLckRounds12IfFinished(seasonStateAfterCupAdvance);
  }

  return seasonStateAfterCupAdvance;
}

function isLckCupCompletedAndWaitingForTransition(seasonState: SeasonState) {
  const lckCup = seasonState.competitions.find(
    (competition) => competition.competitionId === "lck-cup",
  );
  const lckRounds = seasonState.competitions.find(
    (competition) => competition.competitionId === "lck-rounds-1-2",
  );

  return (
    seasonState.currentCompetitionId === "lck-cup" &&
    Boolean(lckCup?.completed) &&
    lckRounds?.status !== "active" &&
    !lckRounds?.completed
  );
}

function playCurrentDate(career: CareerSave): {
  career: CareerSave;
  lastMatch: MatchResult | null;
} {
  const matches = getCurrentDateScheduledMatches(career.seasonState);

  if (matches.length === 0) {
    return { career, lastMatch: null };
  }

  const userTeamId = getUserTeamId(career.seasonState);
  const results = matches.map((match, index) => {
    const isUserMatch =
      match.blueTeamId === userTeamId || match.redTeamId === userTeamId;

    if (isUserMatch) {
      return createMatchRecordFromSchedule({
        career,
        match,
        matchIndex: index,
      });
    }

    return {
      record: createNeutralMatchRecordFromSchedule({
        career,
        match,
        matchIndex: index,
      }),
      lastMatchResult: null,
    };
  });
  const records = results.map((result) => result.record);
  const lastResult =
    results.find((result) => result.record.userResult !== "none")?.lastMatchResult ??
    null;
  const userWins = records.filter((record) => record.userResult === "win").length;
  const userLosses = records.filter((record) => record.userResult === "loss").length;
  const userResult = userWins > 0 ? "win" : userLosses > 0 ? "loss" : "none";
  const seasonStateWithRecords = recordCompletedMatches(
    career.seasonState,
    records,
  );
  const nextSeasonState = advanceCompetitionsAfterCompletedRecords(
    seasonStateWithRecords,
    records,
  );
  const nextPlayers =
    userResult === "none"
      ? career.lckPlayers
      : applyWeeklyPlayerStatusChanges({
          players: career.lckPlayers,
          roster: career.userTeam.roster,
          contractedPlayerIds: career.userTeam.contracts.map(
            (contract) => contract.playerId,
          ),
          trainingIntensity: career.weeklyPlan.trainingIntensity,
          userResult,
        });

  return {
    career: {
      ...career,
      lckPlayers: nextPlayers,
      seasonState: nextSeasonState,
      userTeam: {
        ...career.userTeam,
        wins: career.userTeam.wins + userWins,
        losses: career.userTeam.losses + userLosses,
      },
    },
    lastMatch: lastResult,
  };
}

function advanceIdleDay(career: CareerSave): CareerSave {
  const todaysMatches = getCurrentDateScheduledMatches(career.seasonState);
  const userTeamId = getUserTeamId(career.seasonState);
  const hasUserMatch = todaysMatches.some(
    (match) => match.blueTeamId === userTeamId || match.redTeamId === userTeamId,
  );

  if (todaysMatches.length === 0 || hasUserMatch) {
    return {
      ...career,
      seasonState: advanceToNextDay(career.seasonState),
    };
  }

  const results = todaysMatches.map((match, index) => ({
    record: createNeutralMatchRecordFromSchedule({
      career,
      match,
      matchIndex: index,
    }),
    lastMatchResult: null,
  }));
  const records = results.map((result) => result.record);
  const seasonStateWithRecords = recordCompletedMatches(
    career.seasonState,
    records,
  );
  const advancedSeasonState = advanceCompetitionsAfterCompletedRecords(
    seasonStateWithRecords,
    records,
  );
  const nextSeasonState = isLckCupCompletedAndWaitingForTransition(
    advancedSeasonState,
  )
    ? transitionFromLckCupToLckRounds12(advancedSeasonState)
    : advanceToNextDay(advancedSeasonState);

  return {
    ...career,
    seasonState: nextSeasonState,
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === "start-career") {
    return {
      ...state,
      career: createInitialCareer(action.teamName),
      route: "roster-builder",
      lastMatch: null,
      selectedCompetitionId: null,
    };
  }

  if (action.type === "go-to") {
    return {
      ...state,
      route: action.route,
      selectedCompetitionId:
        action.route === "competition-dashboard"
          ? state.career?.seasonState.currentCompetitionId ?? null
          : state.selectedCompetitionId,
    };
  }

  if (action.type === "view-competition") {
    return {
      ...state,
      route: "competition-dashboard",
      selectedCompetitionId:
        action.competitionId ?? state.career?.seasonState.currentCompetitionId ?? null,
    };
  }

  if (action.type === "set-roster-player") {
    if (!state.career) {
      return state;
    }

    const nextRoster = { ...state.career.userTeam.roster };
    const nextAcademyRosterPlayerIds = [
      ...state.career.userTeam.academyRosterPlayerIds,
    ];
    const previousStarterId = nextRoster[action.role];

    if (action.player) {
      if (previousStarterId && previousStarterId !== action.player.id) {
        nextAcademyRosterPlayerIds.push(previousStarterId);
      }

      nextRoster[action.role] = action.player.id;
    } else {
      delete nextRoster[action.role];

      if (previousStarterId) {
        nextAcademyRosterPlayerIds.push(previousStarterId);
      }
    }

    const starterPlayerIds = Object.values(nextRoster).filter(
      (playerId): playerId is string => Boolean(playerId),
    );
    const starterIds = new Set(starterPlayerIds);
    const dedupedAcademyRosterPlayerIds = [...new Set(nextAcademyRosterPlayerIds)].filter(
      (playerId) => !starterIds.has(playerId),
    );
    const isContractedRoster = state.career.userTeam.contracts.length > 0;
    const contractedPlayerIds = state.career.userTeam.contracts.map(
      (contract) => contract.playerId,
    );
    const nextLckPlayers =
      isContractedRoster &&
      action.player &&
      previousStarterId !== action.player.id
        ? applyCallUpMoraleBoost(state.career.lckPlayers, action.player.id)
        : state.career.lckPlayers;

    return {
      ...state,
      career: {
        ...state.career,
        lckPlayers: nextLckPlayers,
        userTeam: {
          ...state.career.userTeam,
          roster: nextRoster,
          mainRosterPlayerIds: isContractedRoster
            ? starterPlayerIds
            : state.career.userTeam.mainRosterPlayerIds,
          academyRosterPlayerIds: isContractedRoster
            ? contractedPlayerIds.filter((playerId) => !starterIds.has(playerId))
            : dedupedAcademyRosterPlayerIds,
        },
      },
    };
  }

  if (action.type === "sign-roster-player") {
    if (!state.career) {
      return state;
    }

    const selectedPlayerIds = new Set(getSelectedRosterPlayerIds(state.career.userTeam));

    if (selectedPlayerIds.has(action.player.id)) {
      return state;
    }

    return {
      ...state,
      career: {
        ...state.career,
        userTeam: {
          ...state.career.userTeam,
          academyRosterPlayerIds: [
            ...state.career.userTeam.academyRosterPlayerIds,
            action.player.id,
          ],
        },
      },
    };
  }

  if (action.type === "release-roster-player") {
    if (!state.career) {
      return state;
    }

    const nextRoster = { ...state.career.userTeam.roster };

    Object.entries(nextRoster).forEach(([role, playerId]) => {
      if (playerId === action.playerId) {
        delete nextRoster[role as Role];
      }
    });

    return {
      ...state,
      career: {
        ...state.career,
        userTeam: {
          ...state.career.userTeam,
          roster: nextRoster,
          mainRosterPlayerIds: state.career.userTeam.mainRosterPlayerIds.filter(
            (playerId) => playerId !== action.playerId,
          ),
          academyRosterPlayerIds: state.career.userTeam.academyRosterPlayerIds.filter(
            (playerId) => playerId !== action.playerId,
          ),
          contracts: state.career.userTeam.contracts.filter(
            (contract) => contract.playerId !== action.playerId,
          ),
        },
      },
    };
  }

  if (action.type === "confirm-roster") {
    if (!state.career) {
      return state;
    }

    const validation = validateFullRoster({
      team: state.career.userTeam,
      players: state.career.lckPlayers,
      contractTypes: action.contractTypes,
    });

    if (!validation.isValid) {
      return state;
    }

    const selectedPlayerIds = validation.selectedPlayerIds;
    const splitRoster = splitRosterByStarter(state.career.userTeam, selectedPlayerIds);
    const contracts = createContractsForRoster({
      playerIds: selectedPlayerIds,
      players: state.career.lckPlayers,
      contractTypes: action.contractTypes,
    });

    return {
      ...state,
      route: "main-dashboard",
      career: {
        ...state.career,
        seasonState: completeStoveLeague(state.career.seasonState),
        userTeam: {
          ...state.career.userTeam,
          ...splitRoster,
          contracts,
        },
      },
    };
  }

  if (action.type === "set-strategy") {
    if (!state.career) {
      return state;
    }

    return {
      ...state,
      career: {
        ...state.career,
        weeklyPlan: {
          ...state.career.weeklyPlan,
          strategy: action.strategy,
        },
      },
    };
  }

  if (action.type === "set-training-intensity") {
    if (!state.career) {
      return state;
    }

    return {
      ...state,
      career: {
        ...state.career,
        weeklyPlan: {
          ...state.career.weeklyPlan,
          trainingIntensity: action.trainingIntensity,
        },
      },
    };
  }

  if (action.type === "progress-season") {
    if (!state.career) {
      return state;
    }

    if (state.career.seasonState.phase === "stove-league") {
      return state;
    }

    if (state.career.seasonState.progressStatus === "idle") {
      return {
        ...state,
        route: "main-dashboard",
        career: advanceIdleDay(state.career),
        lastMatch: null,
      };
    }

    if (state.career.seasonState.progressStatus === "match-review") {
      const nextSeasonState = isLckCupCompletedAndWaitingForTransition(
        state.career.seasonState,
      )
        ? {
            ...transitionFromLckCupToLckRounds12(state.career.seasonState),
            currentTurn: state.career.seasonState.currentTurn + 1,
          }
        : continueAfterMatchReview(state.career.seasonState);

      return {
        ...state,
        route: "main-dashboard",
        career: {
          ...state.career,
          seasonState: nextSeasonState,
        },
        lastMatch: null,
      };
    }

    const result = playCurrentDate(state.career);

    return {
      ...state,
      route: "main-dashboard",
      career: result.career,
      lastMatch: result.lastMatch,
    };
  }

  if (action.type === "simulate-next-match") {
    if (!state.career) {
      return state;
    }

    const opponent = state.career.internationalOpponents[0];
    const { strategy, trainingIntensity } = state.career.weeklyPlan;
    const draft = runSimpleDraft({
      blueTeam: {
        name: state.career.userTeam.name,
        players: getRosterPlayersByRole(state.career.userTeam, state.career.lckPlayers),
        strategy,
      },
      redTeam: {
        name: opponent.name,
        players: createOpponentDraftPlayers(opponent),
        strategy: mapOpponentStyleToStrategy(opponent.style),
      },
      champions: championPool,
      context: {
        format: "bo1",
        gameNumber: 1,
        fearlessEnabled: false,
        unavailableChampionIds: [],
      },
    });
    const result = simulateMatch({
      team: state.career.userTeam,
      players: state.career.lckPlayers,
      opponent,
      strategy,
      trainingIntensity,
      seed: `season-${state.career.currentSeason}-match-1`,
      draft,
    });
    const nextPlayers = applyWeeklyPlayerStatusChanges({
      players: state.career.lckPlayers,
      roster: state.career.userTeam.roster,
      contractedPlayerIds: state.career.userTeam.contracts.map(
        (contract) => contract.playerId,
      ),
      trainingIntensity,
      userResult: result.winner === "user" ? "win" : "loss",
    });

    return {
      ...state,
      lastMatch: result,
      career: {
        ...state.career,
        lckPlayers: nextPlayers,
        userTeam: {
          ...state.career.userTeam,
          wins: state.career.userTeam.wins + (result.winner === "user" ? 1 : 0),
          losses:
            state.career.userTeam.losses + (result.winner === "opponent" ? 1 : 0),
        },
      },
    };
  }

  return state;
}

export function GameProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const value = useContext(GameContext);

  if (!value) {
    throw new Error("useGame must be used inside GameProvider.");
  }

  return value;
}
