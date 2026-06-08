import { sampleOpponents } from "../../data/sampleOpponents";
import { lck2026Players } from "../../data/lck2026Players";
import { getLckTeamProfile } from "../../data/lckTeams";
import { createInitialSeasonState } from "../season";
import type { CareerSave } from "../../types/game";
import { createPreseasonStoveLeagueCareer } from "./preseasonStoveLeague";

export function createInitialCareer(teamName: string): CareerSave {
  const userTeamName = teamName.trim() || "T1";
  const userTeamProfile = getLckTeamProfile(userTeamName);

  const career: CareerSave = {
    currentSeason: 1,
    maxSeason: 20,
    userTeam: {
      name: userTeamName,
      region: "lck",
      budget: userTeamProfile?.budget ?? 1500,
      rosterSettings: {
        minPlayers: 10,
        maxPlayers: 15,
        freeMovementBetweenMainAndAcademy: true,
        minMainRosterPlayers: 5,
        minAcademyRosterPlayers: 5,
      },
      roster: {},
      mainRosterPlayerIds: [],
      academyRosterPlayerIds: [],
      contracts: [],
      wins: 0,
      losses: 0,
      elo: userTeamProfile?.baseElo ?? 1670,
    },
    lckPlayers: lck2026Players,
    internationalOpponents: sampleOpponents,
    weeklyPlan: {
      strategy: "balanced",
      trainingIntensity: "normal",
    },
    seasonState: createInitialSeasonState({
      seasonNumber: 1,
      userTeamName,
    }),
    seasonHistory: [],
  };

  return createPreseasonStoveLeagueCareer(career);
}
