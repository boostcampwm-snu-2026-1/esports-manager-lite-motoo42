import { describe, expect, it } from "vitest";
import { createInitialCareer } from "../../src/domain/career/createInitialCareer";
import {
  completeStoveLeague,
  createInitialSeasonState,
} from "../../src/domain/season";

describe("createInitialSeasonState", () => {
  it("starts season 1 as a 2026 Asian Games season in stove league", () => {
    const seasonState = createInitialSeasonState({
      seasonNumber: 1,
      userTeamName: "T1",
    });

    expect(seasonState.yearLabel).toBe(2026);
    expect(seasonState.calendarType).toBe("asian-games");
    expect(seasonState.phase).toBe("stove-league");
    expect(seasonState.currentCompetitionId).toBeNull();
    expect(seasonState.currentDateKey).toBe("2026-01-01");
    expect(seasonState.currentDateLabel).toBe("2026 Stove League Week 1");
    expect(seasonState.progressStatus).toBe("idle");
    expect(seasonState.stoveLeague.status).toBe("active");
    expect(seasonState.nextMatchIds).toEqual([]);
  });

  it("keeps LCK Cup inactive until stove league is completed", () => {
    const seasonState = createInitialSeasonState({
      seasonNumber: 1,
      userTeamName: "T1",
    });
    const lckCup = seasonState.competitions.find(
      (competition) => competition.competitionId === "lck-cup",
    );

    expect(lckCup?.status).toBe("locked");

    const activeSeason = completeStoveLeague(seasonState);
    const activeLckCup = activeSeason.competitions.find(
      (competition) => competition.competitionId === "lck-cup",
    );

    expect(activeSeason.phase).toBe("competition");
    expect(activeSeason.currentCompetitionId).toBe("lck-cup");
    expect(activeSeason.currentDateKey).toBe("2026-01-14");
    expect(activeSeason.currentDateLabel).toBe("2026년 1월 14일 (수)");
    expect(activeSeason.progressStatus).toBe("idle");
    expect(activeSeason.stoveLeague.completed).toBe(true);
    expect(activeLckCup?.status).toBe("active");
    expect(activeLckCup?.schedule).toHaveLength(25);
    expect(activeLckCup?.schedule[0].scheduledDate).toBe("2026-01-14");
    expect(activeSeason.nextMatchIds).toHaveLength(0);
    expect(activeLckCup?.standings.filter((entry) => entry.lckCupGroup === "baron")).toHaveLength(5);
    expect(activeLckCup?.standings.filter((entry) => entry.lckCupGroup === "elder")).toHaveLength(5);
  });

  it("creates fixed 10-team LCK standings with real team names", () => {
    const seasonState = createInitialSeasonState({
      seasonNumber: 1,
      userTeamName: "T1",
    });
    const lckCup = seasonState.competitions.find(
      (competition) => competition.competitionId === "lck-cup",
    );

    expect(lckCup?.standings).toHaveLength(10);
    expect(lckCup?.standings.map((entry) => entry.teamName)).toContain("Hanjin BRION");
    expect(lckCup?.standings.map((entry) => entry.teamName)).toContain("DN SOOPers");
    expect(lckCup?.standings.find((entry) => entry.teamName === "T1")?.isUserTeam).toBe(true);
  });

  it("connects the running season state to a new career save", () => {
    const career = createInitialCareer("T1");

    expect(career.seasonState.seasonNumber).toBe(1);
    expect(career.seasonState.phase).toBe("stove-league");
    expect(career.seasonState.competitions).toHaveLength(7);
  });
});
