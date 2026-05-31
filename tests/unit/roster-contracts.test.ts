import { describe, expect, it } from "vitest";
import { samplePlayers } from "../../src/data/samplePlayers";
import {
  createContractsForRoster,
  splitRosterByStarter,
  validateFullRoster,
  type ContractTypeSelections,
} from "../../src/domain/roster";
import type { Team } from "../../src/types/game";

const selectedPlayerIds = [
  "lck-top-02",
  "lck-jungle-01",
  "lck-mid-01",
  "lck-bot-02",
  "lck-support-01",
  "lck-top-04",
  "lck-jungle-04",
  "lck-mid-04",
  "lck-bot-04",
  "lck-support-04",
];

const contractTypes: ContractTypeSelections = Object.fromEntries(
  selectedPlayerIds.map((playerId) => [playerId, "one-year"]),
);

function createTeam(overrides: Partial<Team> = {}): Team {
  return {
    name: "Test Team",
    region: "lck",
    budget: 1200,
    rosterSettings: {
      minPlayers: 10,
      maxPlayers: 15,
      freeMovementBetweenMainAndAcademy: true,
    },
    roster: {
      top: "lck-top-02",
      jungle: "lck-jungle-01",
      mid: "lck-mid-01",
      bot: "lck-bot-02",
      support: "lck-support-01",
    },
    mainRosterPlayerIds: [],
    academyRosterPlayerIds: selectedPlayerIds.slice(5),
    contracts: [],
    wins: 0,
    losses: 0,
    elo: 1500,
    ...overrides,
  };
}

describe("roster contract flow", () => {
  it("accepts a 10-player LCK roster inside yearly budget", () => {
    const result = validateFullRoster({
      team: createTeam(),
      players: samplePlayers,
      contractTypes,
    });

    expect(result.isValid).toBe(true);
    expect(result.selectedPlayerIds).toHaveLength(10);
    expect(result.yearlySalary).toBeLessThanOrEqual(1200);
  });

  it("rejects rosters below the minimum size", () => {
    const result = validateFullRoster({
      team: createTeam({
        academyRosterPlayerIds: [],
      }),
      players: samplePlayers,
      contractTypes,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Roster must include at least 10 players.");
  });

  it("creates contract terms for one-year, two-year, and one-plus-one deals", () => {
    const contracts = createContractsForRoster({
      playerIds: selectedPlayerIds.slice(0, 3),
      players: samplePlayers,
      contractTypes: {
        "lck-top-02": "one-year",
        "lck-jungle-01": "two-year",
        "lck-mid-01": "one-plus-one",
      },
    });

    expect(contracts[0]).toMatchObject({
      type: "one-year",
      guaranteedYears: 1,
      remainingYears: 1,
    });
    expect(contracts[1]).toMatchObject({
      type: "two-year",
      guaranteedYears: 2,
      remainingYears: 2,
    });
    expect(contracts[2]).toMatchObject({
      type: "one-plus-one",
      guaranteedYears: 1,
      optionYear: true,
      remainingYears: 2,
    });
  });

  it("splits starters into main roster and the rest into academy roster", () => {
    const split = splitRosterByStarter(createTeam(), selectedPlayerIds);

    expect(split.mainRosterPlayerIds).toEqual(selectedPlayerIds.slice(0, 5));
    expect(split.academyRosterPlayerIds).toEqual(selectedPlayerIds.slice(5));
  });
});
