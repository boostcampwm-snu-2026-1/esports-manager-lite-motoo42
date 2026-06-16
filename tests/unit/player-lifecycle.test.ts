import { describe, expect, it } from "vitest";
import { samplePlayers } from "../../src/data/samplePlayers";
import { rollPlayerIntoNextSeason } from "../../src/domain/players";

describe("player lifecycle", () => {
  it("grows young prospects toward potential during next-season rollover", () => {
    const prospect = {
      ...samplePlayers[0],
      age: 18,
      overall: 70,
      ability: 69,
      potential: 86,
      salaryExpectation: 70,
      cost: 70,
      development: {
        ...samplePlayers[0].development,
        growthRate: 80,
        peakAgeStart: 22,
        peakAgeEnd: 27,
      },
    };
    const nextPlayer = rollPlayerIntoNextSeason(prospect);

    expect(nextPlayer.age).toBe(19);
    expect(nextPlayer.overall).toBeGreaterThan(prospect.overall);
    expect(nextPlayer.ability).toBeGreaterThan(prospect.ability);
    expect(nextPlayer.overall).toBeLessThanOrEqual(prospect.potential);
    expect(nextPlayer.salaryExpectation).not.toBe(prospect.salaryExpectation);
    expect(nextPlayer.cost).toBe(nextPlayer.salaryExpectation);
  });

  it("declines veterans after peak age without removing them from rosters", () => {
    const veteran = {
      ...samplePlayers[1],
      age: 29,
      retirementAge: 30,
      overall: 84,
      ability: 84,
      potential: 85,
      development: {
        ...samplePlayers[1].development,
        peakAgeStart: 22,
        peakAgeEnd: 27,
        declineRate: 9,
      },
    };
    const nextPlayer = rollPlayerIntoNextSeason(veteran);

    expect(nextPlayer.age).toBe(30);
    expect(nextPlayer.overall).toBeLessThan(veteran.overall);
    expect(nextPlayer.ability).toBeLessThan(veteran.ability);
    expect(nextPlayer.retirementCandidate).toBe(true);
    expect(nextPlayer.availableForRoster).toBe(veteran.availableForRoster);
  });

  it("keeps academy salary expectations near the intended CL scale", () => {
    const academyProspect = {
      ...samplePlayers[0],
      rosterTier: "academy" as const,
      age: 18,
      overall: 72,
      ability: 72,
      potential: 84,
      salaryExpectation: 14,
      cost: 14,
      marketProfile: {
        ...samplePlayers[0].marketProfile,
        marketability: 55,
        fanbase: 45,
        brandRisk: 5,
      },
      development: {
        ...samplePlayers[0].development,
        growthRate: 80,
        peakAgeStart: 22,
        peakAgeEnd: 27,
      },
    };
    const nextPlayer = rollPlayerIntoNextSeason(academyProspect);

    expect(nextPlayer.salaryExpectation).toBeGreaterThanOrEqual(6);
    expect(nextPlayer.salaryExpectation).toBeLessThanOrEqual(24);
    expect(nextPlayer.cost).toBe(nextPlayer.salaryExpectation);
  });

  it("distributes the season delta unevenly across core stats", () => {
    const prospect = {
      ...samplePlayers[0],
      rosterTier: "main" as const,
      age: 19,
      overall: 72,
      ability: 72,
      mechanics: 72,
      macro: 72,
      laning: 72,
      teamfight: 72,
      mental: 72,
      championPool: 72,
      potential: 92,
      development: {
        ...samplePlayers[0].development,
        growthRate: 80,
        peakAgeStart: 22,
        peakAgeEnd: 27,
      },
    };
    const next = rollPlayerIntoNextSeason(prospect);
    const coreDeltas = [
      next.mechanics - prospect.mechanics,
      next.macro - prospect.macro,
      next.laning - prospect.laning,
      next.teamfight - prospect.teamfight,
      next.mental - prospect.mental,
      next.championPool - prospect.championPool,
    ];

    // Every core stat started equal, so any spread proves the jitter is uneven.
    expect(new Set(coreDeltas).size).toBeGreaterThan(1);
  });

  it("develops main-roster regulars faster than benched or teamless players", () => {
    const young = (rosterTier: "main" | "academy" | "free-agent") => ({
      ...samplePlayers[0],
      id: "usage-probe",
      rosterTier,
      age: 19,
      overall: 70,
      ability: 70,
      potential: 92,
      development: {
        ...samplePlayers[0].development,
        growthRate: 80,
        peakAgeStart: 22,
        peakAgeEnd: 27,
      },
    });
    // Same id + age => same seeded variance, so only the usage multiplier differs.
    const main = rollPlayerIntoNextSeason(young("main"));
    const academy = rollPlayerIntoNextSeason(young("academy"));
    const free = rollPlayerIntoNextSeason(young("free-agent"));

    expect(main.overall).toBeGreaterThanOrEqual(academy.overall);
    expect(academy.overall).toBeGreaterThanOrEqual(free.overall);
    expect(main.overall).toBeGreaterThan(free.overall);
  });

  it("lets the user's training intensity nudge their players' growth", () => {
    const player = {
      ...samplePlayers[0],
      id: "training-probe",
      rosterTier: "main" as const,
      age: 20,
      overall: 80,
      ability: 80,
      potential: 88,
      development: {
        ...samplePlayers[0].development,
        growthRate: 70,
        peakAgeStart: 22,
        peakAgeEnd: 27,
      },
    };
    const high = rollPlayerIntoNextSeason(player, { trainingIntensity: "high" });
    const rest = rollPlayerIntoNextSeason(player, { trainingIntensity: "rest" });

    expect(high.overall).toBeGreaterThan(rest.overall);
  });

  it("is deterministic for the same player and season", () => {
    const player = {
      ...samplePlayers[0],
      age: 19,
      overall: 71,
      ability: 71,
      potential: 90,
      development: {
        ...samplePlayers[0].development,
        growthRate: 75,
        peakAgeStart: 22,
        peakAgeEnd: 27,
      },
    };

    expect(rollPlayerIntoNextSeason(player)).toEqual(
      rollPlayerIntoNextSeason(player),
    );
  });

  it("never pushes ratings past potential or the 45-95 bounds", () => {
    const nearCap = {
      ...samplePlayers[0],
      rosterTier: "main" as const,
      age: 18,
      overall: 90,
      ability: 90,
      mechanics: 94,
      potential: 92,
      development: {
        ...samplePlayers[0].development,
        growthRate: 90,
        peakAgeStart: 22,
        peakAgeEnd: 27,
      },
    };
    const next = rollPlayerIntoNextSeason(nearCap);
    const ratings = [
      next.overall,
      next.ability,
      next.mechanics,
      next.macro,
      next.laning,
      next.teamfight,
      next.mental,
      next.championPool,
    ];

    for (const value of ratings) {
      expect(value).toBeGreaterThanOrEqual(45);
      expect(value).toBeLessThanOrEqual(95);
    }
    expect(next.overall).toBeLessThanOrEqual(nearCap.potential);
  });
});
