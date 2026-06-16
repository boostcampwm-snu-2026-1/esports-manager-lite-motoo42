import { describe, expect, it } from "vitest";
import { summarizeSeriesGames } from "../../src/domain/series/summarizeSeriesGames";
import type { SeriesResult } from "../../src/domain/series/seriesTypes";
import type { MatchResult } from "../../src/types/game";

function gameResult(winner: "user" | "opponent", winProbability: number): MatchResult {
  return {
    winner,
    winProbability,
    teamPower: 0,
    opponentPower: 0,
    draftPower: 0,
    log: [],
  };
}

const series: SeriesResult = {
  winner: "user",
  userWins: 2,
  opponentWins: 1,
  format: "bo3",
  usedChampionIds: [],
  games: [
    { gameNumber: 1, result: gameResult("opponent", 0.55) },
    { gameNumber: 2, result: gameResult("user", 0.6) },
    { gameNumber: 3, result: gameResult("user", 0.48) },
  ],
};

describe("summarizeSeriesGames", () => {
  it("keeps per-game order, game number, and the winner's win probability", () => {
    const summaries = summarizeSeriesGames(series, true);

    expect(summaries).toHaveLength(3);
    expect(summaries.map((game) => game.gameNumber)).toEqual([1, 2, 3]);
    // Game 1 went to the opponent, so its winner chance is 1 - 0.55.
    expect(summaries[0].winnerWinProbability).toBeCloseTo(0.45, 5);
    expect(summaries[1].winnerWinProbability).toBeCloseTo(0.6, 5);
    expect(summaries[2].winnerWinProbability).toBeCloseTo(0.48, 5);
  });

  it("maps the user as blue: user wins -> blue, opponent wins -> red", () => {
    const summaries = summarizeSeriesGames(series, true);

    expect(summaries.map((game) => game.winnerSide)).toEqual([
      "red",
      "blue",
      "blue",
    ]);
  });

  it("maps the user as red: user wins -> red, opponent wins -> blue", () => {
    const summaries = summarizeSeriesGames(series, false);

    expect(summaries.map((game) => game.winnerSide)).toEqual([
      "blue",
      "red",
      "red",
    ]);
  });
});
