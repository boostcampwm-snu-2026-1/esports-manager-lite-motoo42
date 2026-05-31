import { describe, expect, it } from "vitest";
import {
  completeLckRounds12IfFinished,
  createInitialLckStandings,
  createInitialSeasonState,
  createLckRounds12Schedule,
  lckRounds12MatchesPerTeam,
  lckRounds12RegularWeeks,
  transitionFromLckCupToLckRounds12,
} from "../../src/domain/season";
import { recordCompletedMatches } from "../../src/domain/season/progressSeason";
import type { MatchRecord, MatchSchedule } from "../../src/types/game";

function createBlueWinRecord(match: MatchSchedule, index: number): MatchRecord {
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
      blueWins: 2,
      redWins: 1,
    },
    userResult:
      match.blueTeamName === "T1"
        ? "win"
        : match.redTeamName === "T1"
          ? "loss"
          : "none",
    log: [`${match.blueTeamName} beat ${match.redTeamName}`],
    createdAtTurn: index + 1,
  };
}

describe("LCK Rounds 1-2 format", () => {
  it("creates a 9-week double round robin with 90 BO3 series", () => {
    const standings = createInitialLckStandings("T1");
    const schedule = createLckRounds12Schedule(standings, {
      calendarType: "asian-games",
      year: 2026,
    });

    expect(schedule).toHaveLength(90);
    expect(schedule.every((match) => match.format === "bo3")).toBe(true);
    expect(schedule.every((match) => !match.fearlessEnabled)).toBe(true);

    for (let week = 1; week <= lckRounds12RegularWeeks; week += 1) {
      const weekMatches = schedule.filter((match) => match.week === week);

      expect(weekMatches).toHaveLength(10);

      standings.forEach((team) => {
        const appearances = weekMatches.filter(
          (match) =>
            match.blueTeamId === team.teamId || match.redTeamId === team.teamId,
        );

        expect(appearances).toHaveLength(2);
      });
    }
  });

  it("gives every team 18 matches and places two series per match day", () => {
    const standings = createInitialLckStandings("T1");
    const schedule = createLckRounds12Schedule(standings, {
      calendarType: "asian-games",
      year: 2026,
    });
    const matchesByTeam = new Map<string, number>();
    const matchesByDate = new Map<string, number>();

    schedule.forEach((match) => {
      matchesByTeam.set(
        match.blueTeamId,
        (matchesByTeam.get(match.blueTeamId) ?? 0) + 1,
      );
      matchesByTeam.set(
        match.redTeamId,
        (matchesByTeam.get(match.redTeamId) ?? 0) + 1,
      );
      matchesByDate.set(
        match.scheduledDate ?? "",
        (matchesByDate.get(match.scheduledDate ?? "") ?? 0) + 1,
      );
    });

    standings.forEach((team) => {
      expect(matchesByTeam.get(team.teamId)).toBe(lckRounds12MatchesPerTeam);
    });
    expect(schedule[0].scheduledDate).toBe("2026-04-01");
    expect(schedule[schedule.length - 1].scheduledDate).toBe("2026-05-31");
    expect([...matchesByDate.values()].every((count) => count === 2)).toBe(true);
  });

  it("completes Rounds 1-2 and stores the top six playoff qualifiers", () => {
    const season = transitionFromLckCupToLckRounds12(
      createInitialSeasonState({
        seasonNumber: 1,
        userTeamName: "T1",
      }),
    );
    const lckRounds = season.competitions.find(
      (competition) => competition.competitionId === "lck-rounds-1-2",
    );

    if (!lckRounds) {
      throw new Error("LCK Rounds 1-2 state was not created.");
    }

    const seasonWithRecords = recordCompletedMatches(
      season,
      lckRounds.schedule.map(createBlueWinRecord),
    );
    const completedSeason = completeLckRounds12IfFinished(seasonWithRecords);
    const completedRounds = completedSeason.competitions.find(
      (competition) => competition.competitionId === "lck-rounds-1-2",
    );

    expect(completedRounds?.status).toBe("completed");
    expect(completedRounds?.completed).toBe(true);
    expect(completedRounds?.currentStageName).toBe("Regular Season Completed");
    expect(completedRounds?.qualifiedTeamIds).toHaveLength(6);
    expect(completedRounds?.qualifiedTeamNames).toHaveLength(6);
  });
});
