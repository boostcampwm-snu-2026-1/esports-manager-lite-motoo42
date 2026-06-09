import type {
  CareerSave,
  CompetitionId,
  MatchRecord,
  MatchSchedule,
} from "../../types/game";

export type CareerIntegrityIssueCode =
  | "asian-games-state-in-normal-season"
  | "current-competition-missing"
  | "duplicate-competition-schedule-id"
  | "duplicate-match-record-id"
  | "duplicate-scheduled-match-id"
  | "invalid-match-record-schedule"
  | "missing-player-reference"
  | "season-history-duplicate-year";

export type CareerIntegrityIssue = {
  code: CareerIntegrityIssueCode;
  message: string;
};

function findDuplicateIds(ids: string[]) {
  const seenIds = new Set<string>();
  const duplicateIds = new Set<string>();

  ids.forEach((id) => {
    if (seenIds.has(id)) {
      duplicateIds.add(id);
      return;
    }

    seenIds.add(id);
  });

  return [...duplicateIds];
}

function createDuplicateIssue({
  code,
  duplicateIds,
  label,
}: {
  code: CareerIntegrityIssueCode;
  duplicateIds: string[];
  label: string;
}): CareerIntegrityIssue | null {
  if (duplicateIds.length === 0) {
    return null;
  }

  return {
    code,
    message: `${label} contains duplicate ids: ${duplicateIds.join(", ")}.`,
  };
}

function getScheduleIds(matches: MatchSchedule[]) {
  return matches.map((match) => match.id);
}

function getRecordIds(records: MatchRecord[]) {
  return records.map((record) => record.id);
}

function getCompetitionIds(career: CareerSave) {
  return new Set(
    career.seasonState.competitions.map(
      (competition) => competition.competitionId,
    ),
  );
}

function getAllKnownScheduleIds(career: CareerSave) {
  return new Set([
    ...career.seasonState.scheduledMatches.map((match) => match.id),
    ...career.seasonState.competitions.flatMap((competition) =>
      competition.schedule.map((match) => match.id),
    ),
  ]);
}

function getRosterPlayerIds(career: CareerSave) {
  return [
    ...Object.values(career.userTeam.roster),
    ...career.userTeam.mainRosterPlayerIds,
    ...career.userTeam.academyRosterPlayerIds,
    ...career.userTeam.contracts.map((contract) => contract.playerId),
  ].filter((playerId): playerId is string => Boolean(playerId));
}

export function validateCareerIntegrity(career: CareerSave) {
  const issues: CareerIntegrityIssue[] = [];
  const competitionIds = getCompetitionIds(career);
  const currentCompetitionId = career.seasonState.currentCompetitionId;
  const scheduledMatchDuplicateIssue = createDuplicateIssue({
    code: "duplicate-scheduled-match-id",
    duplicateIds: findDuplicateIds(getScheduleIds(career.seasonState.scheduledMatches)),
    label: "scheduledMatches",
  });
  const competitionScheduleDuplicateIssue = createDuplicateIssue({
    code: "duplicate-competition-schedule-id",
    duplicateIds: findDuplicateIds(
      career.seasonState.competitions.flatMap((competition) =>
        competition.schedule.map((match) => match.id),
      ),
    ),
    label: "competition schedules",
  });
  const matchRecordDuplicateIssue = createDuplicateIssue({
    code: "duplicate-match-record-id",
    duplicateIds: findDuplicateIds(getRecordIds(career.seasonState.matchRecords)),
    label: "matchRecords",
  });
  const seasonYearDuplicateIssue = createDuplicateIssue({
    code: "season-history-duplicate-year",
    duplicateIds: findDuplicateIds(
      career.seasonHistory
        .map((summary) => summary.yearLabel)
        .filter((yearLabel): yearLabel is number => typeof yearLabel === "number")
        .map(String),
    ),
    label: "seasonHistory",
  });

  [
    scheduledMatchDuplicateIssue,
    competitionScheduleDuplicateIssue,
    matchRecordDuplicateIssue,
    seasonYearDuplicateIssue,
  ].forEach((issue) => {
    if (issue) {
      issues.push(issue);
    }
  });

  if (currentCompetitionId && !competitionIds.has(currentCompetitionId)) {
    issues.push({
      code: "current-competition-missing",
      message: `currentCompetitionId ${currentCompetitionId} is not present in competitions.`,
    });
  }

  if (
    career.seasonState.calendarType === "normal" &&
    (career.seasonState.asianGames ||
      currentCompetitionId === "asian-games" ||
      competitionIds.has("asian-games" as CompetitionId))
  ) {
    issues.push({
      code: "asian-games-state-in-normal-season",
      message: "Normal season contains Asian Games state or competition.",
    });
  }

  const knownScheduleIds = getAllKnownScheduleIds(career);
  const invalidRecords = career.seasonState.matchRecords.filter(
    (record) => !knownScheduleIds.has(record.scheduleId),
  );

  if (invalidRecords.length > 0) {
    issues.push({
      code: "invalid-match-record-schedule",
      message: `matchRecords reference missing schedules: ${invalidRecords
        .map((record) => `${record.id}->${record.scheduleId}`)
        .join(", ")}.`,
    });
  }

  const knownPlayerIds = new Set(career.lckPlayers.map((player) => player.id));
  const missingPlayerIds = [
    ...new Set(
      getRosterPlayerIds(career).filter(
        (playerId) => !knownPlayerIds.has(playerId),
      ),
    ),
  ];

  if (missingPlayerIds.length > 0) {
    issues.push({
      code: "missing-player-reference",
      message: `Roster or contract references missing players: ${missingPlayerIds.join(", ")}.`,
    });
  }

  return issues;
}

export function formatCareerIntegrityIssues(issues: CareerIntegrityIssue[]) {
  return issues.map((issue) => `[${issue.code}] ${issue.message}`).join(" ");
}
