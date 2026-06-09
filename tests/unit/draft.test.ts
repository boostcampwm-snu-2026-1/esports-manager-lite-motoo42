import { describe, expect, it } from "vitest";
import { sampleOpponents } from "../../src/data/sampleOpponents";
import { samplePlayers } from "../../src/data/samplePlayers";
import { championPool } from "../../src/domain/champions";
import {
  createOpponentDraftPlayers,
  getRosterPlayersByRole,
  mapOpponentStyleToStrategy,
  runSimpleDraft,
} from "../../src/domain/draft";
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

describe("runSimpleDraft", () => {
  it("creates quantitative draft indicators and respects fearless bans", () => {
    const opponent = sampleOpponents[0];
    const draft = runSimpleDraft({
      blueTeam: {
        name: completeTeam.name,
        players: getRosterPlayersByRole(completeTeam, samplePlayers),
        strategy: "balanced",
      },
      redTeam: {
        name: opponent.name,
        players: createOpponentDraftPlayers(opponent),
        strategy: mapOpponentStyleToStrategy(opponent.style),
      },
      champions: championPool,
      context: {
        format: "bo3",
        gameNumber: 2,
        fearlessEnabled: true,
        unavailableChampionIds: ["azir"],
      },
    });

    expect(draft.blueDraftPower).toBeGreaterThan(0);
    expect(draft.redDraftPower).toBeGreaterThan(0);
    expect(draft.netDraftPower).toBeGreaterThanOrEqual(-10);
    expect(draft.netDraftPower).toBeLessThanOrEqual(10);
    expect(draft.usedChampionIds).not.toContain("azir");
    expect(draft.notes.some((note) => note.includes("fearless"))).toBe(true);
  });
});
