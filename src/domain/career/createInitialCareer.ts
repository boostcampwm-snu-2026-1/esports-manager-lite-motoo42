import { sampleOpponents } from "../../data/sampleOpponents";
import { lck2026Players } from "../../data/lck2026Players";
import { getLckTeamProfile } from "../../data/lckTeams";
import { offseasonFreeAgentSeeds } from "../../data/offseasonFreeAgents";
import { completeStoveLeague, createInitialSeasonState } from "../season";
import type { CareerSave, Player, PlayerContract, Role, Team } from "../../types/game";
import { createPreseasonStoveLeagueCareer } from "./preseasonStoveLeague";

export type CareerStartMode = "preseason" | "real-roster-lck-cup";

export type CreateInitialCareerOptions = {
  startMode?: CareerStartMode;
};

const roleOrder: Role[] = ["top", "jungle", "mid", "bot", "support"];

function normalizeTeamName(value: string | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function isTeamPlayer(player: Player, teamName: string) {
  return normalizeTeamName(player.currentTeam) === normalizeTeamName(teamName);
}

function pickStarterForRole(players: Player[], role: Role) {
  return [...players]
    .filter((player) => player.role === role && player.availableForRoster)
    .sort((left, right) => {
      const tierDiff =
        (right.rosterTier === "main" ? 1 : 0) -
        (left.rosterTier === "main" ? 1 : 0);

      if (tierDiff !== 0) {
        return tierDiff;
      }

      const overallDiff = right.overall - left.overall;

      if (overallDiff !== 0) {
        return overallDiff;
      }

      return left.id.localeCompare(right.id);
    })[0];
}

function createStarterRoster(teamPlayers: Player[]) {
  return roleOrder.reduce<Partial<Record<Role, string>>>((roster, role) => {
    const starter = pickStarterForRole(teamPlayers, role);

    if (starter) {
      roster[role] = starter.id;
    }

    return roster;
  }, {});
}

function createActiveContract(player: Player): PlayerContract {
  return {
    playerId: player.id,
    salary: player.salaryExpectation,
    type: "one-year",
    guaranteedYears: 1,
    remainingYears: 1,
  };
}

function mergeFreeAgentSeeds(players: Player[]) {
  const seenIds = new Set(players.map((player) => player.id));
  const seenNames = new Set(
    players.map((player) => player.name.trim().toLowerCase()),
  );

  return [
    ...players,
    ...offseasonFreeAgentSeeds.filter((player) => {
      const nameKey = player.name.trim().toLowerCase();

      return !seenIds.has(player.id) && !seenNames.has(nameKey);
    }),
  ];
}

function createRealRosterLckCupCareer(career: CareerSave): CareerSave {
  const lckPlayers = mergeFreeAgentSeeds(career.lckPlayers);
  const selectedTeamPlayers = lckPlayers
    .filter((player) => isTeamPlayer(player, career.userTeam.name))
    .sort((left, right) => left.id.localeCompare(right.id));
  const mainRosterPlayerIds = selectedTeamPlayers
    .filter((player) => player.rosterTier !== "academy")
    .map((player) => player.id);
  const academyRosterPlayerIds = selectedTeamPlayers
    .filter((player) => player.rosterTier === "academy")
    .map((player) => player.id);
  const roster = createStarterRoster(
    selectedTeamPlayers.filter((player) => player.rosterTier !== "academy"),
  );
  const starterIds = new Set(Object.values(roster).filter(Boolean));
  const userTeam: Team = {
    ...career.userTeam,
    roster,
    mainRosterPlayerIds: [
      ...new Set([
        ...Object.values(roster).filter((playerId): playerId is string =>
          Boolean(playerId),
        ),
        ...mainRosterPlayerIds.filter((playerId) => !starterIds.has(playerId)),
      ]),
    ],
    academyRosterPlayerIds,
    contracts: selectedTeamPlayers.map(createActiveContract),
  };

  return {
    ...career,
    lckPlayers,
    userTeam,
    seasonState: {
      ...completeStoveLeague(career.seasonState),
      offseason: undefined,
    },
  };
}

export function createInitialCareer(
  teamName: string,
  options: CreateInitialCareerOptions = {},
): CareerSave {
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
    guideState: {
      seenGuideIds: [],
    },
  };

  if (options.startMode === "real-roster-lck-cup") {
    return createRealRosterLckCupCareer(career);
  }

  return createPreseasonStoveLeagueCareer(career);
}
