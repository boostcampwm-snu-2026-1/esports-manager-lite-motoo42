import { describe, expect, it } from "vitest";
import { completeStoveLeague, createInitialSeasonState } from "../../src/domain/season";
import {
  advanceToNextDay,
  advanceToNextMatchWeek,
  continueAfterMatchReview,
  getCurrentDateScheduledMatches,
  getPreviewMatches,
  getSeasonProgressActionLabel,
  recordCompletedMatches,
} from "../../src/domain/season/progressSeason";
import { addDaysToDateKey } from "../../src/domain/season/seasonScheduleDates";
import type { MatchRecord, MatchSchedule } from "../../src/types/game";

function createActiveSeason() {
  return completeStoveLeague(
    createInitialSeasonState({
      seasonNumber: 1,
      userTeamName: "T1",
    }),
  );
}

function createIdleSeasonOn(dateKey: string) {
  return {
    ...createActiveSeason(),
    currentDateKey: dateKey,
    currentDateLabel:
      dateKey === "2026-01-15"
        ? "2026년 1월 15일 (목)"
        : "2026년 1월 16일 (금)",
    progressStatus: "idle" as const,
    nextMatchIds: [],
  };
}

function createBlueWinRecord(match: MatchSchedule, index: number): MatchRecord {
  const t1IsBlue = match.blueTeamName === "T1";
  const t1IsRed = match.redTeamName === "T1";

  return {
    id: `${match.id}-record-${index}`,
    scheduleId: match.id,
    competitionId: match.competitionId,
    week: match.week,
    stageName: match.stageName,
    winnerSide: "blue",
    winnerTeamId: match.blueTeamId,
    winnerTeamName: match.blueTeamName,
    score: {
      blueWins: match.format === "bo5" ? 3 : 2,
      redWins: 1,
    },
    userResult: t1IsBlue ? "win" : t1IsRed ? "loss" : "none",
    winProbability: 0.58,
    log: [`${match.blueTeamName} beat ${match.redTeamName}`],
    createdAtTurn: 2,
  };
}

describe("season progress", () => {
  it("starts LCK Cup on the first real match date and keeps play locked to user match days", () => {
    const season = createActiveSeason();
    const currentMatches = getCurrentDateScheduledMatches(season);

    expect(season.scheduledMatches).toHaveLength(25);
    expect(season.currentDateKey).toBe("2026-01-14");
    expect(season.progressStatus).toBe("match-preview");
    expect(getSeasonProgressActionLabel(season)).toBe("플레이");
    expect(getPreviewMatches(season)).toHaveLength(2);
    expect(currentMatches).toHaveLength(2);
    expect(currentMatches[0].format).toBe("bo3");
    expect(
      currentMatches.some(
        (match) => match.blueTeamName === "T1" || match.redTeamName === "T1",
      ),
    ).toBe(true);
  });

  it("can jump from idle to the next user match preview", () => {
    const season = createIdleSeasonOn("2026-01-15");
    const previewSeason = advanceToNextMatchWeek(season);
    const previewMatches = getPreviewMatches(previewSeason);

    expect(previewSeason.progressStatus).toBe("match-preview");
    expect(getSeasonProgressActionLabel(previewSeason)).toBe("플레이");
    expect(previewSeason.currentDateKey > season.currentDateKey).toBe(true);
    expect(previewMatches.length).toBeGreaterThan(0);
    expect(
      previewMatches.some(
        (match) => match.blueTeamName === "T1" || match.redTeamName === "T1",
      ),
    ).toBe(true);
  });

  it("records a completed user match day and moves to review state", () => {
    const season = createActiveSeason();
    const matches = getCurrentDateScheduledMatches(season);
    const reviewedSeason = recordCompletedMatches(
      season,
      matches.map(createBlueWinRecord),
    );
    const lckCup = reviewedSeason.competitions.find(
      (competition) => competition.competitionId === "lck-cup",
    );

    expect(reviewedSeason.progressStatus).toBe("match-review");
    expect(getSeasonProgressActionLabel(reviewedSeason)).toBe("진행");
    expect(reviewedSeason.lastMatchRecordIds).toHaveLength(matches.length);
    expect(
      reviewedSeason.scheduledMatches
        .filter((match) => match.scheduledDate === season.currentDateKey)
        .every((match) => match.status === "completed"),
    ).toBe(true);
    expect(lckCup?.standings.find((entry) => entry.teamName === "T1")?.wins).toBeGreaterThanOrEqual(0);
  });

  it("continues from review by one day instead of skipping a whole week", () => {
    const season = createActiveSeason();
    const matches = getCurrentDateScheduledMatches(season);
    const reviewedSeason = recordCompletedMatches(
      season,
      matches.map(createBlueWinRecord),
    );
    const nextDaySeason = continueAfterMatchReview(reviewedSeason);

    expect(nextDaySeason.currentDateKey).toBe(
      addDaysToDateKey(reviewedSeason.currentDateKey, 1),
    );
    expect(getSeasonProgressActionLabel(nextDaySeason)).toBe(
      nextDaySeason.progressStatus === "match-preview" ? "플레이" : "진행",
    );
    expect(nextDaySeason.lastMatchRecordIds).toEqual([]);
  });

  it("advances an idle non-user day by one real calendar date", () => {
    const season = createIdleSeasonOn("2026-01-15");
    const nextDaySeason = advanceToNextDay(season);

    expect(nextDaySeason.currentDateKey).toBe("2026-01-16");
    expect(nextDaySeason.currentDateLabel).toBe("2026년 1월 16일 (금)");
  });
});
