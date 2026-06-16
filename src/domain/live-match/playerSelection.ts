import { lck2026Players } from "../../data/lck2026Players";
import { findLckTeamSeed } from "../../data/lckTeams";
import type { CareerSave, Player, Role } from "../../types/game";
import { liveMatchRoleLabels } from "./mockDraft";

const fallbackNames: Record<string, Partial<Record<Role, string>>> = {
  "Gen.G": {
    top: "Kiin",
    jungle: "Canyon",
    mid: "Chovy",
    bot: "Ruler",
    support: "Duro",
  },
  T1: {
    top: "Doran",
    jungle: "Oner",
    mid: "Faker",
    bot: "Peyz",
    support: "Keria",
  },
};

export function getLiveMatchUserTeamId(career: CareerSave | null) {
  if (!career) {
    return "t1";
  }

  return (
    career.seasonState.competitions
      .find(
        (competition) =>
          competition.competitionId === career.seasonState.currentCompetitionId,
      )
      ?.standings.find((entry) => entry.isUserTeam)?.teamId ?? "user-team"
  );
}

function normalizeTeamName(value: string) {
  return value.trim().toLowerCase();
}

function getKnownTeamNames(teamName: string) {
  const seed = findLckTeamSeed(teamName);

  return new Set(
    [teamName, seed?.name, seed?.displayNameKo, seed?.shortName]
      .filter((value): value is string => Boolean(value))
      .map(normalizeTeamName),
  );
}

function getTeamPlayerForRole({
  career,
  role,
  teamName,
}: {
  career: CareerSave | null;
  role: Role;
  teamName: string;
}) {
  const teamNames = getKnownTeamNames(teamName);
  const playerPool = career?.lckPlayers ?? lck2026Players;

  return [...playerPool]
    .filter(
      (player) =>
        player.role === role &&
        player.availableForRoster &&
        player.currentTeam &&
        teamNames.has(normalizeTeamName(player.currentTeam)),
    )
    .sort((left, right) => right.overall - left.overall)[0];
}

function getUserPlayerForRole(career: CareerSave | null, role: Role) {
  if (!career) {
    return undefined;
  }

  const starterId = career.userTeam.roster[role];
  const starter = starterId
    ? career.lckPlayers.find((player) => player.id === starterId)
    : undefined;

  if (starter) {
    return starter;
  }

  return career.lckPlayers
    .filter(
      (player) =>
        player.role === role &&
        career.userTeam.mainRosterPlayerIds.includes(player.id),
    )
    .sort((left, right) => right.overall - left.overall)[0];
}

function getFallbackPlayerName(teamName: string, role: Role) {
  const seed = findLckTeamSeed(teamName);
  const names =
    fallbackNames[teamName] ??
    (seed ? fallbackNames[seed.name] : undefined) ??
    (seed ? fallbackNames[seed.shortName] : undefined);

  return (
    names?.[role] ?? `${seed?.shortName ?? teamName} ${liveMatchRoleLabels[role]}`
  );
}

function findFallbackPlayer(teamName: string, role: Role) {
  const fallbackName = getFallbackPlayerName(teamName, role);
  const teamNames = getKnownTeamNames(teamName);
  return lck2026Players.find(
    (player) =>
      player.name === fallbackName &&
      player.role === role &&
      player.currentTeam &&
      teamNames.has(normalizeTeamName(player.currentTeam)),
  );
}

function createFallbackPlayer(
  teamName: string,
  role: Role,
): Pick<Player, "name" | "portraitUrl"> {
  const fallbackName = getFallbackPlayerName(teamName, role);
  const fallbackPlayer = findFallbackPlayer(teamName, role);

  return {
    name: fallbackName,
    portraitUrl: fallbackPlayer?.portraitUrl,
  };
}

export function getLiveMatchPlayerForRole({
  career,
  isUserTeam,
  role,
  teamName,
}: {
  career: CareerSave | null;
  isUserTeam: boolean;
  role: Role;
  teamName: string;
}) {
  return (
    (isUserTeam
      ? getUserPlayerForRole(career, role)
      : getTeamPlayerForRole({ career, role, teamName })) ??
    findFallbackPlayer(teamName, role)
  );
}

export function getLiveMatchPlayerIdentity({
  career,
  isUserTeam,
  role,
  teamName,
}: {
  career: CareerSave | null;
  isUserTeam: boolean;
  role: Role;
  teamName: string;
}): Pick<Player, "name" | "portraitUrl"> {
  const player = getLiveMatchPlayerForRole({
    career,
    isUserTeam,
    role,
    teamName,
  });
  const fallback = createFallbackPlayer(teamName, role);

  return {
    name: player?.name ?? fallback.name,
    portraitUrl: player?.portraitUrl ?? fallback.portraitUrl,
  };
}
