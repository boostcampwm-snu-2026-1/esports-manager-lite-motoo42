import {
  getOffseasonMinimumAcceptableSalary,
  initializeOffseasonMarket,
  isAsianGamesDecisionPending,
  releaseExpiredOffseasonPlayer,
  startNextSeasonFromOffseason,
  setAsianGamesPlayMode,
  submitOffseasonRenewalOffer,
} from "../season";
import type { CareerSave, ContractType } from "../../types/game";
import {
  progressCareer,
  type CareerProgressTrace,
} from "./progressCareer";
import {
  formatCareerIntegrityIssues,
  validateCareerIntegrity,
} from "./careerIntegrity";

export type CareerProgressDebugRunnerFailureReason =
  | "asian-games-state-in-normal-season"
  | "integrity-violation"
  | "max-step-exceeded"
  | "progress-blocked"
  | "state-repeat";

export type CareerProgressDebugStep = {
  step: number;
  autoActions: string[];
  trace: CareerProgressTrace;
};

export type CareerProgressDebugRunnerResult = {
  status: "completed" | "failed";
  career: CareerSave;
  steps: CareerProgressDebugStep[];
  failureReason?: CareerProgressDebugRunnerFailureReason;
  failureMessage?: string;
  lastTrace?: CareerProgressTrace;
};

export type CareerProgressDebugRunnerOptions = {
  maxSteps?: number;
  target?: (career: CareerSave) => boolean;
};

const defaultMaxSteps = 2500;
const defaultRenewalContractType: ContractType = "one-year";

function hasReachedDefault2027Target(career: CareerSave) {
  return (
    career.currentSeason === 3 &&
    career.seasonState.yearLabel === 2028 &&
    career.seasonState.phase === "competition" &&
    career.seasonState.currentCompetitionId === "lck-cup"
  );
}

function hasAsianGamesStateInNormalSeason(career: CareerSave) {
  return (
    career.seasonState.calendarType === "normal" &&
    (Boolean(career.seasonState.asianGames) ||
      career.seasonState.currentCompetitionId === "asian-games" ||
      career.seasonState.competitions.some(
        (competition) => competition.competitionId === "asian-games",
      ))
  );
}

function createRunnerFingerprint(career: CareerSave) {
  const seasonState = career.seasonState;
  const activeCompetition = seasonState.competitions.find(
    (competition) =>
      competition.competitionId === seasonState.currentCompetitionId,
  );

  return [
    career.currentSeason,
    career.seasonHistory.length,
    seasonState.seasonNumber,
    seasonState.yearLabel,
    seasonState.calendarType,
    seasonState.phase,
    seasonState.currentCompetitionId ?? "no-competition",
    seasonState.currentDateKey,
    seasonState.currentTurn,
    seasonState.currentWeek,
    seasonState.progressStatus,
    activeCompetition?.status ?? "no-status",
    activeCompetition?.currentStageName ?? "no-stage",
    activeCompetition?.completed ? "completed" : "not-completed",
    seasonState.matchRecords.length,
    seasonState.nextMatchIds.join(","),
    seasonState.lastMatchRecordIds.join(","),
    seasonState.offseason?.status ?? "no-offseason",
    seasonState.offseason?.currentDay ?? "no-offseason-day",
    seasonState.offseason?.currentWeek ?? "no-offseason-week",
    seasonState.worlds?.status ?? "no-worlds",
    career.userTeam.contracts
      .map(
        (contract) =>
          `${contract.playerId}:${contract.remainingYears}:${contract.salary}`,
      )
      .join(","),
  ].join("|");
}

function getLastDebugStep(steps: CareerProgressDebugStep[]) {
  return steps.length > 0 ? steps[steps.length - 1] : undefined;
}

function getPlayer(career: CareerSave, playerId: string) {
  return career.lckPlayers.find((player) => player.id === playerId);
}

function getStarterIds(career: CareerSave) {
  return new Set(
    Object.values(career.userTeam.roster).filter(
      (playerId): playerId is string => Boolean(playerId),
    ),
  );
}

function getActiveContractPlayerIds(career: CareerSave) {
  return new Set(
    career.userTeam.contracts
      .filter((contract) => {
        const player = getPlayer(career, contract.playerId);

        return contract.remainingYears > 0 && player?.availableForRoster;
      })
      .map((contract) => contract.playerId),
  );
}

function getDebugRenewalPriority(career: CareerSave, playerId: string) {
  const player = getPlayer(career, playerId);
  const starterIds = getStarterIds(career);

  if (!player) {
    return Number.NEGATIVE_INFINITY;
  }

  const starterScore = starterIds.has(playerId) ? 10000 : 0;
  const tierScore = player.rosterTier === "main" ? 1000 : 0;

  return starterScore + tierScore + player.overall * 10 + player.potential;
}

function pickDebugRenewalPlayerIds(
  career: CareerSave,
  unresolvedPlayerIds: string[],
) {
  const starterIds = getStarterIds(career);
  const activeContractPlayerIds = getActiveContractPlayerIds(career);
  const selectedIds = new Set<string>();
  const minimumPlayers = career.userTeam.rosterSettings.minPlayers;
  const sortedPlayerIds = [...unresolvedPlayerIds].sort((left, right) => {
    const priorityDiff =
      getDebugRenewalPriority(career, right) -
      getDebugRenewalPriority(career, left);

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return left.localeCompare(right);
  });

  sortedPlayerIds.forEach((playerId) => {
    if (starterIds.has(playerId)) {
      selectedIds.add(playerId);
    }
  });

  sortedPlayerIds.forEach((playerId) => {
    if (activeContractPlayerIds.size + selectedIds.size >= minimumPlayers) {
      return;
    }

    selectedIds.add(playerId);
  });

  return selectedIds;
}

function resolveRenewalWeekForDebug(career: CareerSave) {
  const offseason = career.seasonState.offseason;
  let nextCareer = career;
  const autoActions: string[] = [];

  if (
    career.seasonState.phase !== "offseason" ||
    offseason?.status !== "active" ||
    (offseason.currentWeek ?? 1) !== 1
  ) {
    return { career, autoActions };
  }

  if ((offseason.currentDay ?? 1) < 7) {
    return { career, autoActions };
  }

  const resolvedIds = new Set([
    ...(offseason.renewedPlayerIds ?? []),
    ...(offseason.releasedPlayerIds ?? []),
    ...(offseason.resolvedExpiredPlayerIds ?? []),
  ]);
  const pendingRenewalIds = new Set(
    (offseason.pendingOffers ?? [])
      .filter(
        (offer) =>
          offer.status === "pending" &&
          offer.negotiationContext === "renewal",
      )
      .flatMap((offer) => offer.playerIds),
  );
  const unresolvedPlayerIds = offseason.expiredContractPlayerIds.filter(
    (playerId) => !resolvedIds.has(playerId) && !pendingRenewalIds.has(playerId),
  );
  const renewalPlayerIds = pickDebugRenewalPlayerIds(
    career,
    unresolvedPlayerIds,
  );

  unresolvedPlayerIds.forEach((playerId) => {
    const player = getPlayer(nextCareer, playerId);

    if (!player) {
      return;
    }

    if (renewalPlayerIds.has(playerId)) {
      const salaryOffer = getOffseasonMinimumAcceptableSalary({
        context: "renewal",
        contractType: defaultRenewalContractType,
        day: offseason.currentDay ?? 7,
        player,
      });
      nextCareer = submitOffseasonRenewalOffer(nextCareer, {
        playerId,
        contractType: defaultRenewalContractType,
        salaryOffer,
      });
      autoActions.push(`renew:${playerId}:${defaultRenewalContractType}`);
      return;
    }

    nextCareer = releaseExpiredOffseasonPlayer(nextCareer, playerId);
    autoActions.push(`release:${playerId}`);
  });

  return { career: nextCareer, autoActions };
}

function applyDebugAutomation(career: CareerSave) {
  const offseason = career.seasonState.offseason;

  if (isAsianGamesDecisionPending(career.seasonState)) {
    return {
      career: {
        ...career,
        seasonState: setAsianGamesPlayMode(career.seasonState, "auto"),
      },
      autoActions: ["set-asian-games-auto"],
    };
  }

  if (
    career.seasonState.phase === "offseason" &&
    offseason?.status === "summary"
  ) {
    return {
      career: initializeOffseasonMarket(career),
      autoActions: ["start-offseason-market"],
    };
  }

  if (
    career.seasonState.phase === "offseason" &&
    offseason?.status === "ready-for-next-season"
  ) {
    return {
      career: startNextSeasonFromOffseason(career),
      autoActions: ["start-next-season"],
    };
  }

  return resolveRenewalWeekForDebug(career);
}

export function runCareerProgressDebugRunner(
  initialCareer: CareerSave,
  options: CareerProgressDebugRunnerOptions = {},
): CareerProgressDebugRunnerResult {
  const maxSteps = options.maxSteps ?? defaultMaxSteps;
  const hasReachedTarget = options.target ?? hasReachedDefault2027Target;
  const steps: CareerProgressDebugStep[] = [];
  const seenFingerprints = new Map<string, number>();
  let career = initialCareer;

  for (let step = 0; step < maxSteps; step += 1) {
    const automated = applyDebugAutomation(career);
    career = automated.career;

    if (hasAsianGamesStateInNormalSeason(career)) {
      return {
        status: "failed",
        career,
        steps,
        failureReason: "asian-games-state-in-normal-season",
        failureMessage:
          "Normal season career contains Asian Games state or competition.",
        lastTrace: getLastDebugStep(steps)?.trace,
      };
    }

    const integrityIssues = validateCareerIntegrity(career);

    if (integrityIssues.length > 0) {
      return {
        status: "failed",
        career,
        steps,
        failureReason: "integrity-violation",
        failureMessage: formatCareerIntegrityIssues(integrityIssues),
        lastTrace: getLastDebugStep(steps)?.trace,
      };
    }

    if (hasReachedTarget(career)) {
      return {
        status: "completed",
        career,
        steps,
      };
    }

    const fingerprint = createRunnerFingerprint(career);
    const previousStep = seenFingerprints.get(fingerprint);

    if (previousStep !== undefined) {
      return {
        status: "failed",
        career,
        steps,
        failureReason: "state-repeat",
        failureMessage: `Career state repeated from debug step ${previousStep}.`,
        lastTrace: getLastDebugStep(steps)?.trace,
      };
    }
    seenFingerprints.set(fingerprint, step);

    const result = progressCareer(career);
    career = result.career;

    if (result.trace) {
      steps.push({
        step: step + 1,
        autoActions: automated.autoActions,
        trace: result.trace,
      });
    }

    if (result.trace?.blockReason) {
      return {
        status: "failed",
        career,
        steps,
        failureReason: "progress-blocked",
        failureMessage: result.trace.blockReason,
        lastTrace: result.trace,
      };
    }
  }

  return {
    status: "failed",
    career,
    steps,
    failureReason: "max-step-exceeded",
    failureMessage: `Debug runner exceeded ${maxSteps} steps before reaching the target.`,
    lastTrace: getLastDebugStep(steps)?.trace,
  };
}
