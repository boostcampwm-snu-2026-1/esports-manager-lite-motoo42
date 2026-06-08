import { describe, expect, it } from "vitest";
import {
  getAutosaveName,
  getCareerAutoSaveCheckpoint,
} from "../../src/app/autoSaveCheckpoint";
import { createInitialCareer } from "../../src/domain/career/createInitialCareer";

describe("auto save checkpoint", () => {
  it("uses the user team and season for the autosave name", () => {
    const career = createInitialCareer("T1");

    expect(getAutosaveName(career)).toBe("T1 S1 Autosave");
  });

  it("changes when player lifecycle values change", () => {
    const career = createInitialCareer("T1");
    const baseCheckpoint = getCareerAutoSaveCheckpoint(career);

    const updatedCareer = {
      ...career,
      lckPlayers: career.lckPlayers.map((player, index) =>
        index === 0
          ? {
              ...player,
              age: player.age + 1,
              overall: player.overall + 1,
              salaryExpectation: player.salaryExpectation + 100,
              cost: player.cost + 100,
              retirementCandidate: true,
            }
          : player,
      ),
    };

    expect(getCareerAutoSaveCheckpoint(updatedCareer)).not.toBe(
      baseCheckpoint,
    );
  });

  it("changes when roster or weekly plan values change", () => {
    const career = createInitialCareer("T1");
    const baseCheckpoint = getCareerAutoSaveCheckpoint(career);

    const updatedCareer = {
      ...career,
      userTeam: {
        ...career.userTeam,
        roster: {
          ...career.userTeam.roster,
          top: career.userTeam.mainRosterPlayerIds[1],
        },
      },
      weeklyPlan: {
        ...career.weeklyPlan,
        trainingIntensity: "high" as const,
      },
    };

    expect(getCareerAutoSaveCheckpoint(updatedCareer)).not.toBe(
      baseCheckpoint,
    );
  });

  it("changes when season history offseason summary changes", () => {
    const career = createInitialCareer("T1");
    const baseCheckpoint = getCareerAutoSaveCheckpoint(career);
    const updatedCareer = {
      ...career,
      seasonHistory: [
        {
          seasonNumber: 1,
          yearLabel: 2026,
          calendarType: "asian-games" as const,
          lckResult: "우승",
          finalElo: 1710,
          offseasonSummary: {
            renewedPlayerIds: ["lck-top-01"],
            releasedPlayerIds: [],
            signedPlayerIds: ["lck-mid-01"],
            aiSigningCount: 2,
            retiredPlayerIds: [],
            militaryServicePlayerIds: [],
            notableLogEntries: [
              {
                id: "log-1",
                day: 7,
                week: 1,
                type: "renewal" as const,
                message: "Zeus가 팀에 남았습니다.",
              },
            ],
          },
        },
      ],
    };

    expect(getCareerAutoSaveCheckpoint(updatedCareer)).not.toBe(
      baseCheckpoint,
    );
  });
});
