import {
  createContractsForRoster,
  type ContractTypeSelections,
} from "../roster";
import { rollPlayerIntoNextSeason } from "../players";
import { findLckTeamSeed, getLckTeamProfile, lck2026Teams } from "../../data/lckTeams";
import type {
  CareerSave,
  CompetitionId,
  CompetitionState,
  SeasonCompetitionSummary,
  SeasonOffseasonSummary,
  SeasonState,
  SeasonSummary,
  StandingEntry,
  TeamBalanceAdjustment,
} from "../../types/game";
import {
  completeStoveLeague,
  createInitialSeasonState,
} from "./createInitialSeasonState";

const endOfSeasonCompetitionIds: CompetitionId[] = [
  "lck-cup",
  "first-stand",
  "lck-rounds-1-2",
  "msi",
  "lck-rounds-3-4",
  "lck-rounds-3-5",
  "asian-games",
  "worlds",
];

function findCompetition(
  seasonState: SeasonState,
  competitionId: CompetitionId,
) {
  return seasonState.competitions.find(
    (competition) => competition.competitionId === competitionId,
  );
}

function getUserTeamId(competition: CompetitionState | undefined) {
  return competition?.standings.find((entry) => entry.isUserTeam)?.teamId;
}

function countUserRecords(competition: CompetitionState, seasonState: SeasonState) {
  const competitionScheduleIds = new Set(
    competition.schedule.map((match) => match.id),
  );
  const records = seasonState.matchRecords.filter((record) =>
    competitionScheduleIds.has(record.scheduleId),
  );
  const wins = records.filter((record) => record.userResult === "win").length;
  const losses = records.filter((record) => record.userResult === "loss").length;

  return { wins, losses };
}

function getUserResultLabel(
  competition: CompetitionState,
  seasonState: SeasonState,
) {
  const userTeamId = getUserTeamId(competition);
  const userEntry = competition.standings.find((entry) => entry.isUserTeam);

  if (userTeamId && competition.winnerTeamId === userTeamId) {
    return "우승";
  }

  if (userEntry?.rank) {
    return `${userEntry.rank}위`;
  }

  if (userTeamId && competition.qualifiedTeamIds.includes(userTeamId)) {
    return "진출";
  }

  const userRecord = countUserRecords(competition, seasonState);

  if (userRecord.wins + userRecord.losses > 0) {
    return `${userRecord.wins}승 ${userRecord.losses}패`;
  }

  return undefined;
}

function getCompetitionResultLabel(competition: CompetitionState) {
  if (competition.completed) {
    return competition.winnerTeamName
      ? `${competition.winnerTeamName} 우승`
      : "완료";
  }

  if (competition.status === "active") {
    return "진행 중";
  }

  if (competition.status === "available") {
    return "대기";
  }

  return "미진행";
}

export function createSeasonSummaryFromCareer(career: CareerSave): SeasonSummary {
  const seasonState = career.seasonState;
  const competitionResults: SeasonCompetitionSummary[] =
    endOfSeasonCompetitionIds
      .map((competitionId) => findCompetition(seasonState, competitionId))
      .filter(
        (competition): competition is CompetitionState =>
          competition !== undefined && competition.status !== "locked",
      )
      .map((competition) => ({
        competitionId: competition.competitionId,
        competitionName: competition.name,
        resultLabel: getCompetitionResultLabel(competition),
        winnerTeamName: competition.winnerTeamName,
        userResultLabel: getUserResultLabel(competition, seasonState),
      }));
  const lckCompetition = ([
    "lck-rounds-3-5",
    "lck-rounds-3-4",
    "lck-rounds-1-2",
    "lck-cup",
  ] as CompetitionId[])
    .map((competitionId) => findCompetition(seasonState, competitionId))
    .find(
      (competition): competition is CompetitionState =>
        competition !== undefined && competition.status !== "locked",
    );
  const worlds = findCompetition(seasonState, "worlds");
  const msi = findCompetition(seasonState, "msi");
  const asianGames = findCompetition(seasonState, "asian-games");

  return {
    seasonNumber: career.currentSeason,
    yearLabel: seasonState.yearLabel,
    calendarType: seasonState.calendarType,
    lckResult: lckCompetition
      ? getUserResultLabel(lckCompetition, seasonState) ??
        getCompetitionResultLabel(lckCompetition)
      : "미진행",
    internationalResult: worlds?.winnerTeamName
      ? `Worlds Champion: ${worlds.winnerTeamName}`
      : msi
        ? getCompetitionResultLabel(msi)
        : undefined,
    asianGamesResult: asianGames
      ? getCompetitionResultLabel(asianGames)
      : undefined,
    finalElo: career.userTeam.elo,
    completedDateKey: seasonState.currentDateKey,
    finalRecord: {
      wins: career.userTeam.wins,
      losses: career.userTeam.losses,
    },
    competitionResults,
    worldsChampionTeamName: worlds?.winnerTeamName,
    nextSeasonNumber:
      career.currentSeason < career.maxSeason ? career.currentSeason + 1 : undefined,
  };
}

function replaceSeasonSummary(
  history: SeasonSummary[],
  summary: SeasonSummary,
) {
  return [
    ...history.filter((entry) => entry.seasonNumber !== summary.seasonNumber),
    summary,
  ].sort((left, right) => left.seasonNumber - right.seasonNumber);
}

function createOffseasonSummaryFromCareer(
  career: CareerSave,
): SeasonOffseasonSummary | undefined {
  const offseason = career.seasonState.offseason;

  if (!offseason) {
    return undefined;
  }

  const userTeamName = career.userTeam.name;
  const resolvedOffers = offseason.resolvedOffers ?? [];
  const aiSigningCount = resolvedOffers.filter(
    (offer) =>
      offer.status === "accepted" &&
      offer.fromTeamName !== userTeamName &&
      (offer.negotiationContext === "free-agent" ||
        offer.negotiationContext === "ai-depth"),
  ).length;
  const notableLogEntries = (offseason.logEntries ?? [])
    .filter((entry) => entry.type !== "blocked")
    .slice(-8);

  return {
    renewedPlayerIds: offseason.renewedPlayerIds ?? [],
    releasedPlayerIds: offseason.releasedPlayerIds ?? [],
    signedPlayerIds: offseason.signedPlayerIds ?? [],
    aiSigningCount,
    retiredPlayerIds: offseason.retiredPlayerIds ?? [],
    militaryServicePlayerIds: offseason.militaryServicePlayerIds ?? [],
    notableLogEntries,
  };
}

function attachOffseasonSummaryToHistory(career: CareerSave): CareerSave {
  const offseason = career.seasonState.offseason;

  if (!offseason) {
    return career;
  }

  const summarySeasonNumber =
    offseason.summarySeasonNumber ?? offseason.completedSeasonNumber;
  const seasonSummary = career.seasonHistory.find(
    (summary) => summary.seasonNumber === summarySeasonNumber,
  );
  const offseasonSummary = createOffseasonSummaryFromCareer(career);

  if (!seasonSummary || !offseasonSummary) {
    return career;
  }

  return {
    ...career,
    seasonHistory: replaceSeasonSummary(career.seasonHistory, {
      ...seasonSummary,
      offseasonSummary,
    }),
  };
}

function decrementContractYears(career: CareerSave) {
  const contracts = career.userTeam.contracts.map((contract) => ({
    ...contract,
    remainingYears: Math.max(0, contract.remainingYears - 1),
  }));
  const expiredContractPlayerIds = contracts
    .filter((contract) => contract.remainingYears === 0)
    .map((contract) => contract.playerId);

  return { contracts, expiredContractPlayerIds };
}

function isWorldsCompleted(seasonState: SeasonState) {
  const worlds = findCompetition(seasonState, "worlds");

  return Boolean(worlds?.completed && seasonState.worlds?.status === "completed");
}

export function completeSeasonAfterWorlds(career: CareerSave): CareerSave {
  if (
    career.seasonState.phase === "offseason" ||
    career.seasonState.phase === "completed" ||
    career.seasonState.offseason?.completedSeasonNumber === career.currentSeason ||
    !isWorldsCompleted(career.seasonState)
  ) {
    return career;
  }

  const summary = createSeasonSummaryFromCareer(career);
  const { contracts, expiredContractPlayerIds } = decrementContractYears(career);
  const isCareerComplete = career.currentSeason >= career.maxSeason;
  const offseasonStatus = isCareerComplete ? "career-completed" : "summary";
  const completedDateLabel = isCareerComplete
    ? `${career.seasonState.yearLabel} Career Complete`
    : `${career.seasonState.yearLabel} Offseason`;
  const summaryWithContracts: SeasonSummary = {
    ...summary,
    expiredContractPlayerIds,
  };

  return {
    ...career,
    seasonHistory: replaceSeasonSummary(career.seasonHistory, summaryWithContracts),
    userTeam: {
      ...career.userTeam,
      contracts,
    },
    seasonState: {
      ...career.seasonState,
      phase: isCareerComplete ? "completed" : "offseason",
      currentDateLabel: completedDateLabel,
      progressStatus: "idle",
      nextMatchIds: [],
      lastMatchRecordIds: [],
      offseason: {
        status: offseasonStatus,
        completedSeasonNumber: career.currentSeason,
        nextSeasonNumber: isCareerComplete ? undefined : career.currentSeason + 1,
        startedDateKey: career.seasonState.currentDateKey,
        expiredContractPlayerIds,
        renewedPlayerIds: [],
        summarySeasonNumber: career.currentSeason,
        bridgeNote:
          "Season summary is ready. Enter the stove league to resolve contracts and free agency.",
      },
    },
  };
}

export function renewExpiredContractsForOffseason({
  career,
  contractTypes,
}: {
  career: CareerSave;
  contractTypes: ContractTypeSelections;
}): CareerSave {
  const offseason = career.seasonState.offseason;

  if (
    career.seasonState.phase !== "offseason" ||
    !offseason ||
    offseason.status === "ready-for-next-season" ||
    offseason.expiredContractPlayerIds.some((playerId) => !contractTypes[playerId])
  ) {
    return career;
  }

  const renewedContracts = createContractsForRoster({
    playerIds: offseason.expiredContractPlayerIds,
    players: career.lckPlayers,
    contractTypes,
  });
  const renewedByPlayerId = new Map(
    renewedContracts.map((contract) => [contract.playerId, contract]),
  );

  return {
    ...career,
    userTeam: {
      ...career.userTeam,
      contracts: career.userTeam.contracts.map(
        (contract) => renewedByPlayerId.get(contract.playerId) ?? contract,
      ),
    },
    seasonState: {
      ...career.seasonState,
      offseason: {
        ...offseason,
        status: "ready-for-next-season",
        renewedPlayerIds: offseason.expiredContractPlayerIds,
      },
    },
  };
}

function hasUnresolvedExpiredContracts(career: CareerSave) {
  const expiredIds = new Set(
    career.seasonState.offseason?.expiredContractPlayerIds ?? [],
  );
  const resolvedIds = new Set([
    ...(career.seasonState.offseason?.renewedPlayerIds ?? []),
    ...(career.seasonState.offseason?.releasedPlayerIds ?? []),
    ...(career.seasonState.offseason?.resolvedExpiredPlayerIds ?? []),
  ]);

  return [...expiredIds].some((playerId) => !resolvedIds.has(playerId));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getFinalLckCompetition(seasonState: SeasonState) {
  return ([
    "lck-rounds-3-5",
    "lck-rounds-3-4",
    "lck-rounds-1-2",
    "lck-cup",
  ] as CompetitionId[])
    .map((competitionId) => findCompetition(seasonState, competitionId))
    .find(
      (competition): competition is CompetitionState =>
        competition !== undefined &&
        competition.status !== "locked" &&
        competition.standings.length > 0,
    );
}

function findBaseTeamForStanding(entry: StandingEntry) {
  if (entry.teamId === "user-team") {
    return findLckTeamSeed("T1");
  }

  return (
    lck2026Teams.find((team) => team.id === entry.teamId) ??
    findLckTeamSeed(entry.teamName)
  );
}

function createTeamBalanceAdjustment(entry: StandingEntry): TeamBalanceAdjustment | null {
  const baseTeam = findBaseTeamForStanding(entry);

  if (!baseTeam) {
    return null;
  }

  const resultRank = entry.rank || baseTeam.previousSeasonRank;
  const expectedRank = baseTeam.previousSeasonRank;
  const rankDelta = expectedRank - resultRank;
  let baseEloDelta = 0;
  let budgetDelta = 0;
  let strengthDelta = 0;

  if (rankDelta >= 2) {
    baseEloDelta += 20;
    budgetDelta += 40;
    strengthDelta += 1;
  } else if (rankDelta === 1) {
    baseEloDelta += 10;
    budgetDelta += 20;
  } else if (rankDelta <= -2) {
    baseEloDelta -= 20;
    budgetDelta -= 40;
    strengthDelta -= 1;
  } else if (rankDelta === -1) {
    baseEloDelta -= 10;
    budgetDelta -= 20;
  }

  if (resultRank === 1) {
    baseEloDelta += 10;
    budgetDelta += 30;
    strengthDelta += 1;
  }

  baseEloDelta = clamp(baseEloDelta, -35, 35);
  budgetDelta = clamp(budgetDelta, -70, 70);
  strengthDelta = clamp(strengthDelta, -2, 2);

  return {
    teamId: entry.teamId,
    teamName: entry.teamName,
    expectedRank,
    resultRank,
    baseEloDelta,
    strengthDelta,
    budgetDelta,
    reason:
      rankDelta > 0
        ? `${entry.teamName} overperformed by ${rankDelta} rank(s).`
        : rankDelta < 0
          ? `${entry.teamName} underperformed by ${Math.abs(rankDelta)} rank(s).`
          : `${entry.teamName} matched the expected rank.`,
  };
}

export function calculateNextSeasonTeamBalanceAdjustments(
  career: CareerSave,
): TeamBalanceAdjustment[] {
  const lckCompetition = getFinalLckCompetition(career.seasonState);

  if (!lckCompetition) {
    return [];
  }

  return lckCompetition.standings
    .map(createTeamBalanceAdjustment)
    .filter(
      (adjustment): adjustment is TeamBalanceAdjustment =>
        adjustment !== null &&
        (adjustment.baseEloDelta !== 0 ||
          adjustment.budgetDelta !== 0 ||
          adjustment.strengthDelta !== 0),
    );
}

function getUserTeamAdjustment(
  career: CareerSave,
  adjustments: TeamBalanceAdjustment[],
) {
  const userEntry = getFinalLckCompetition(career.seasonState)?.standings.find(
    (entry) => entry.isUserTeam,
  );

  return adjustments.find(
    (adjustment) =>
      adjustment.teamId === userEntry?.teamId ||
      adjustment.teamName === userEntry?.teamName ||
      adjustment.teamName === career.userTeam.name,
  );
}

export function startNextSeasonFromOffseason(career: CareerSave): CareerSave {
  const offseason = career.seasonState.offseason;

  if (
    career.seasonState.phase !== "offseason" ||
    !offseason ||
    offseason.status !== "ready-for-next-season" ||
    hasUnresolvedExpiredContracts(career) ||
    career.currentSeason >= career.maxSeason
  ) {
    return career;
  }

  const nextSeasonNumber = career.currentSeason + 1;
  const careerWithOffseasonSummary = attachOffseasonSummaryToHistory(career);
  const teamBalanceAdjustments =
    calculateNextSeasonTeamBalanceAdjustments(careerWithOffseasonSummary);
  const userTeamAdjustment = getUserTeamAdjustment(
    careerWithOffseasonSummary,
    teamBalanceAdjustments,
  );
  const userTeamProfile = getLckTeamProfile(
    careerWithOffseasonSummary.userTeam.name,
    teamBalanceAdjustments,
  );
  const nextSeasonState = completeStoveLeague(
    createInitialSeasonState({
      seasonNumber: nextSeasonNumber,
      teamBalanceAdjustments,
      userTeamName: careerWithOffseasonSummary.userTeam.name,
    }),
  );

  // Training intensity only develops the user's own players, so flag which player
  // ids belong to the user team and pass this season's intensity to just those.
  const userPlayerIds = new Set(
    [
      ...Object.values(careerWithOffseasonSummary.userTeam.roster),
      ...careerWithOffseasonSummary.userTeam.mainRosterPlayerIds,
      ...careerWithOffseasonSummary.userTeam.academyRosterPlayerIds,
    ].filter((id): id is string => Boolean(id)),
  );
  const seasonTrainingIntensity =
    careerWithOffseasonSummary.weeklyPlan.trainingIntensity;

  return {
    ...careerWithOffseasonSummary,
    currentSeason: nextSeasonNumber,
    lckPlayers: careerWithOffseasonSummary.lckPlayers.map((player) =>
      rollPlayerIntoNextSeason(player, {
        trainingIntensity: userPlayerIds.has(player.id)
          ? seasonTrainingIntensity
          : undefined,
      }),
    ),
    weeklyPlan: {
      strategy: "balanced",
      trainingIntensity: "normal",
    },
    userTeam: {
      ...careerWithOffseasonSummary.userTeam,
      budget: userTeamProfile?.budget ?? careerWithOffseasonSummary.userTeam.budget,
      elo: clamp(
        Math.round(
          careerWithOffseasonSummary.userTeam.elo +
            (userTeamAdjustment?.baseEloDelta ?? 0),
        ),
        1300,
        1900,
      ),
      wins: 0,
      losses: 0,
    },
    seasonState: nextSeasonState,
  };
}
