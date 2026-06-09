import { describe, expect, it } from "vitest";
import { samplePlayers } from "../../src/data/samplePlayers";
import {
  getFavorableStylesAgainst,
  getKeyLaneFromOpponentRoster,
  getOutlookGrade,
  getStyleMatchupScore,
  getUnfavorableStylesAgainst,
} from "../../src/domain/opponent-analysis";
import type { Opponent, Team } from "../../src/types/game";

const emptyTeam: Team = {
  name: "Test Team",
  region: "lck",
  budget: 650,
  rosterSettings: {
    minPlayers: 10,
    maxPlayers: 15,
    freeMovementBetweenMainAndAcademy: true,
  },
  roster: {},
  mainRosterPlayerIds: [],
  academyRosterPlayerIds: [],
  contracts: [],
  wins: 0,
  losses: 0,
  elo: 1500,
};

const t1Opponent: Opponent = {
  id: "t1",
  name: "T1",
  region: "lck",
  leagueLabel: "LCK",
  appearsIn: ["lck-cup"],
  strength: 86,
  style: "balanced",
};

describe("opponent analysis", () => {
  it("uses the same six strategy styles for matchup relationships", () => {
    expect(getStyleMatchupScore("vision", "aggressive")).toBeGreaterThan(0);
    expect(getStyleMatchupScore("scaling", "aggressive")).toBeLessThan(0);
    expect(getFavorableStylesAgainst("aggressive")).toContain("vision");
    expect(getUnfavorableStylesAgainst("aggressive")).toContain("scaling");
  });

  it("grades matchup outlook without exposing a numeric win chance", () => {
    expect(getOutlookGrade(10)).toBe("강한 우세");
    expect(getOutlookGrade(4)).toBe("우세");
    expect(getOutlookGrade(0)).toBe("백중세");
    expect(getOutlookGrade(-4)).toBe("열세");
    expect(getOutlookGrade(-10)).toBe("강한 열세");
  });

  it("selects the opponent key lane from the highest-form roster player", () => {
    const boostedOner = {
      ...samplePlayers.find((player) => player.name === "Oner")!,
      status: {
        ...samplePlayers.find((player) => player.name === "Oner")!.status,
        form: 91,
      },
    };
    const players = samplePlayers.map((player) =>
      player.id === boostedOner.id ? boostedOner : player,
    );
    const keyLane = getKeyLaneFromOpponentRoster({
      opponent: t1Opponent,
      opponentTeamName: "T1",
      players,
      team: emptyTeam,
    });

    expect(keyLane.playerName).toBe("Oner");
    expect(keyLane.role).toBe("jungle");
    expect(keyLane.form).toBe(91);
  });
});
