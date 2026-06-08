import { describe, expect, it } from "vitest";
import { gameReducer } from "../../src/app/state/gameReducer";
import { gameActions } from "../../src/app/state";
import { createInitialCareer } from "../../src/domain/career/createInitialCareer";
import type { CareerSave } from "../../src/types/game";

function activateContracts(career: CareerSave): CareerSave {
  return {
    ...career,
    userTeam: {
      ...career.userTeam,
      contracts: career.userTeam.contracts.map((contract) => ({
        ...contract,
        remainingYears: 1,
      })),
    },
  };
}

function createState(career: CareerSave) {
  return {
    career,
    lastMatch: null,
    route: "roster-builder" as const,
    selectedCompetitionId: null,
  };
}

describe("roster action handlers", () => {
  it("moves a contracted academy player up to the main roster without duplicates", () => {
    const career = activateContracts(createInitialCareer("T1"));
    const academyPlayerId = career.userTeam.academyRosterPlayerIds[0];
    const nextState = gameReducer(
      createState(career),
      gameActions.callUpPlayer(academyPlayerId),
    );

    expect(nextState.career?.userTeam.mainRosterPlayerIds).toContain(
      academyPlayerId,
    );
    expect(nextState.career?.userTeam.academyRosterPlayerIds).not.toContain(
      academyPlayerId,
    );
    expect(
      nextState.career?.userTeam.mainRosterPlayerIds.filter(
        (playerId) => playerId === academyPlayerId,
      ),
    ).toHaveLength(1);
  });

  it("moves a non-starter main roster player down to academy", () => {
    const career = activateContracts(createInitialCareer("T1"));
    const academyPlayerId = career.userTeam.academyRosterPlayerIds[0];
    const calledUp = gameReducer(
      createState(career),
      gameActions.callUpPlayer(academyPlayerId),
    );
    const sentDown = gameReducer(
      calledUp,
      gameActions.sendDownPlayer(academyPlayerId),
    );

    expect(sentDown.career?.userTeam.mainRosterPlayerIds).not.toContain(
      academyPlayerId,
    );
    expect(sentDown.career?.userTeam.academyRosterPlayerIds).toContain(
      academyPlayerId,
    );
  });

  it("does not send down a current starter", () => {
    const career = activateContracts(createInitialCareer("T1"));
    const starterId = career.userTeam.roster.mid!;
    const nextState = gameReducer(
      createState(career),
      gameActions.sendDownPlayer(starterId),
    );

    expect(nextState.career?.userTeam.mainRosterPlayerIds).toContain(starterId);
    expect(nextState.career?.userTeam.academyRosterPlayerIds).not.toContain(
      starterId,
    );
  });
});
