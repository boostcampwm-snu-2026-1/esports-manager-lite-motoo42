import { describe, expect, it } from "vitest";
import { samplePlayers } from "../../src/data/samplePlayers";
import { validateRoster } from "../../src/domain/roster";
import type { Team } from "../../src/types/game";

function createTeam(roster: Team["roster"]): Team {
  return {
    name: "Test Team",
    region: "lck",
    budget: 650,
    rosterSettings: {
      minPlayers: 10,
      maxPlayers: 15,
      freeMovementBetweenMainAndAcademy: true,
    },
    roster,
    mainRosterPlayerIds: [],
    academyRosterPlayerIds: [],
    contracts: [],
    wins: 0,
    losses: 0,
    elo: 1500,
  };
}

describe("validateRoster", () => {
  it("rejects incomplete rosters", () => {
    const result = validateRoster(createTeam({}), samplePlayers);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Missing top player.");
  });

  it("accepts a complete LCK roster inside budget", () => {
    const result = validateRoster(
      createTeam({
        top: "lck-top-01",
        jungle: "lck-jungle-01",
        mid: "lck-mid-01",
        bot: "lck-bot-01",
        support: "lck-support-01",
      }),
      samplePlayers,
    );

    expect(result.isValid).toBe(true);
  });
});
