import { describe, expect, it } from "vitest";
import { samplePlayers } from "../../src/data/samplePlayers";
import { calculateChampionFit, championPool } from "../../src/domain/champions";

function getChampion(championId: string) {
  const champion = championPool.find((candidate) => candidate.id === championId);

  if (!champion) {
    throw new Error(`Missing test champion: ${championId}`);
  }

  return champion;
}

describe("calculateChampionFit", () => {
  it("rewards preferred and signature picks over disliked picks", () => {
    const gumayusi = samplePlayers.find((player) => player.name === "Gumayusi");

    if (!gumayusi) {
      throw new Error("Missing Gumayusi fixture.");
    }

    const varusFit = calculateChampionFit({
      player: gumayusi,
      champion: getChampion("varus"),
      role: "bot",
      strategy: "balanced",
    });
    const zeriFit = calculateChampionFit({
      player: gumayusi,
      champion: getChampion("zeri"),
      role: "bot",
      strategy: "balanced",
    });

    expect(varusFit.score).toBeGreaterThan(zeriFit.score);
    expect(varusFit.reasons).toContain("preferred pick");
    expect(zeriFit.reasons).toContain("disliked pick");
  });

  it("marks fearless-unavailable champions as unusable", () => {
    const faker = samplePlayers.find((player) => player.name === "Faker");

    if (!faker) {
      throw new Error("Missing Faker fixture.");
    }

    const fit = calculateChampionFit({
      player: faker,
      champion: getChampion("azir"),
      role: "mid",
      strategy: "scaling",
      unavailableChampionIds: ["azir"],
    });

    expect(fit.unavailable).toBe(true);
    expect(fit.score).toBe(-999);
  });
});
