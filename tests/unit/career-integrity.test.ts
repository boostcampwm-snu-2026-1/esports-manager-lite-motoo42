import { describe, expect, it } from "vitest";
import { createInitialCareer } from "../../src/domain/career/createInitialCareer";
import { validateCareerIntegrity } from "../../src/domain/game-progress/careerIntegrity";
import type { MatchRecord, MatchSchedule } from "../../src/types/game";

function createMatch(overrides: Partial<MatchSchedule> = {}): MatchSchedule {
  return {
    id: "match-1",
    competitionId: "lck-cup",
    week: 1,
    scheduledDate: "2026-01-14",
    stageName: "Group Battle",
    blueTeamId: "T1",
    blueTeamName: "T1",
    redTeamId: "GEN",
    redTeamName: "Gen.G",
    format: "bo3",
    status: "scheduled",
    fearlessEnabled: false,
    ...overrides,
  };
}

function createRecord(overrides: Partial<MatchRecord> = {}): MatchRecord {
  return {
    id: "record-1",
    scheduleId: "match-1",
    competitionId: "lck-cup",
    week: 1,
    stageName: "Group Battle",
    winnerSide: "blue",
    winnerTeamId: "T1",
    winnerTeamName: "T1",
    score: { blueWins: 2, redWins: 0 },
    userResult: "win",
    log: [],
    createdAtTurn: 1,
    ...overrides,
  };
}

describe("career integrity", () => {
  it("accepts a freshly created career", () => {
    expect(validateCareerIntegrity(createInitialCareer("T1"))).toEqual([]);
  });

  it("detects duplicate schedule and record ids", () => {
    const career = createInitialCareer("T1");
    const match = createMatch();
    const record = createRecord();
    const issues = validateCareerIntegrity({
      ...career,
      seasonState: {
        ...career.seasonState,
        scheduledMatches: [match, match],
        matchRecords: [record, record],
      },
    });

    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "duplicate-scheduled-match-id",
        "duplicate-match-record-id",
      ]),
    );
  });

  it("detects missing schedule references from match records", () => {
    const career = createInitialCareer("T1");
    const issues = validateCareerIntegrity({
      ...career,
      seasonState: {
        ...career.seasonState,
        matchRecords: [createRecord({ scheduleId: "missing-schedule" })],
      },
    });

    expect(issues.map((issue) => issue.code)).toContain(
      "invalid-match-record-schedule",
    );
  });

  it("detects roster references to missing players", () => {
    const career = createInitialCareer("T1");
    const issues = validateCareerIntegrity({
      ...career,
      userTeam: {
        ...career.userTeam,
        contracts: [
          {
            playerId: "missing-player",
            type: "one-year",
            salary: 70,
            guaranteedYears: 1,
            remainingYears: 1,
          },
        ],
      },
    });

    expect(issues.map((issue) => issue.code)).toContain(
      "missing-player-reference",
    );
  });
});
