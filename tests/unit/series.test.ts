import { describe, expect, it } from "vitest";
import { sampleOpponents } from "../../src/data/sampleOpponents";
import { samplePlayers } from "../../src/data/samplePlayers";
import { simulateSeries } from "../../src/domain/series";
import type { Team } from "../../src/types/game";

const completeTeam: Team = {
  name: "Test Team",
  region: "lck",
  budget: 650,
  rosterSettings: {
    minPlayers: 10,
    maxPlayers: 15,
    freeMovementBetweenMainAndAcademy: true,
  },
  roster: {
    top: "lck-top-01",
    jungle: "lck-jungle-01",
    mid: "lck-mid-01",
    bot: "lck-bot-01",
    support: "lck-support-01",
  },
  mainRosterPlayerIds: [],
  academyRosterPlayerIds: [],
  contracts: [],
  wins: 0,
  losses: 0,
  elo: 1500,
};

describe("simulateSeries", () => {
  it("plays a best-of-three until one side reaches two wins", () => {
    const result = simulateSeries({
      team: completeTeam,
      players: samplePlayers,
      opponent: sampleOpponents[0],
      strategy: "balanced",
      trainingIntensity: "normal",
      seed: "series-seed",
      format: "bo3",
      fearlessEnabled: true,
    });

    expect(result.games.length).toBeGreaterThanOrEqual(2);
    expect(result.games.length).toBeLessThanOrEqual(3);
    expect(Math.max(result.userWins, result.opponentWins)).toBe(2);
    expect(result.games.every((game) => game.result.draft)).toBe(true);
    expect(result.usedChampionIds.length).toBeGreaterThan(0);
  });
});
