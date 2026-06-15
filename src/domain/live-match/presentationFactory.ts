import { getPreviewMatches } from "../season/progressSeason";
import { championPool } from "../champions";
import { runSimpleDraft, type DraftTeam } from "../draft";
import { getLckOpponentStyle } from "../opponents/lckOpponentProfiles";
import type {
  CareerSave,
  MatchFormat,
  MatchSchedule,
  Player,
  Role,
  StrategyId,
} from "../../types/game";
import {
  applyDraftToLiveMatchTeams,
  createLiveMatchDraftFromSummary,
  getDraftPickChampionIds,
} from "./draftAdapter";
import { mockLiveMatchDraft } from "./mockDraft";
import { liveMatchRoles } from "./mockDraft";
import { mockLiveMatchTimelineEvents } from "./mockTimeline";
import { createMockLiveMatchTeam } from "./mockTeams";
import {
  getLiveMatchPlayerForRole,
  getLiveMatchUserTeamId,
} from "./playerSelection";
import type { LiveMatchPresentation } from "./types";

function getPrimaryPreviewMatch(career: CareerSave | null) {
  if (!career) {
    return undefined;
  }

  const userTeamId = getLiveMatchUserTeamId(career);

  return getPreviewMatches(career.seasonState).find(
    (match) => match.blueTeamId === userTeamId || match.redTeamId === userTeamId,
  );
}

function getTeamNameForSide(match: MatchSchedule | undefined, side: "blue" | "red") {
  if (!match) {
    return side === "blue" ? "T1" : "Gen.G";
  }

  return side === "blue" ? match.blueTeamName : match.redTeamName;
}

function getTeamIdForSide(match: MatchSchedule | undefined, side: "blue" | "red") {
  if (!match) {
    return side === "blue" ? "t1" : "gen-g";
  }

  return side === "blue" ? match.blueTeamId : match.redTeamId;
}

function isUserTeam({
  career,
  match,
  side,
  userTeamId,
}: {
  career: CareerSave | null;
  match?: MatchSchedule;
  side: "blue" | "red";
  userTeamId: string;
}) {
  const teamId = getTeamIdForSide(match, side);
  const teamName = getTeamNameForSide(match, side);

  return teamId === userTeamId || Boolean(career && teamName === career.userTeam.name);
}

function getDraftStrategy({
  career,
  match,
  side,
  userTeamId,
}: {
  career: CareerSave | null;
  match?: MatchSchedule;
  side: "blue" | "red";
  userTeamId: string;
}): StrategyId {
  if (isUserTeam({ career, match, side, userTeamId })) {
    return career?.weeklyPlan.strategy ?? "balanced";
  }

  return getLckOpponentStyle(getTeamIdForSide(match, side));
}

function getDraftPlayersByRole({
  career,
  match,
  side,
  userTeamId,
}: {
  career: CareerSave | null;
  match?: MatchSchedule;
  side: "blue" | "red";
  userTeamId: string;
}) {
  const teamName = getTeamNameForSide(match, side);
  const userControlledTeam = isUserTeam({ career, match, side, userTeamId });
  const players: Partial<Record<Role, Player>> = {};

  for (const role of liveMatchRoles) {
    const player = getLiveMatchPlayerForRole({
      career,
      isUserTeam: userControlledTeam,
      role,
      teamName,
    });

    if (player) {
      players[role] = player;
    }
  }

  return players;
}

function createDraftTeamForSide({
  career,
  match,
  side,
  userTeamId,
}: {
  career: CareerSave | null;
  match?: MatchSchedule;
  side: "blue" | "red";
  userTeamId: string;
}): DraftTeam {
  return {
    name: getTeamNameForSide(match, side),
    players: getDraftPlayersByRole({ career, match, side, userTeamId }),
    strategy: getDraftStrategy({ career, match, side, userTeamId }),
  };
}

function createLiveMatchDraftSummary({
  career,
  format,
  match,
  userTeamId,
}: {
  career: CareerSave | null;
  format: MatchFormat;
  match?: MatchSchedule;
  userTeamId: string;
}) {
  return runSimpleDraft({
    blueTeam: createDraftTeamForSide({
      career,
      match,
      side: "blue",
      userTeamId,
    }),
    champions: championPool,
    context: {
      banCount: 5,
      fearlessEnabled: match?.fearlessEnabled ?? format !== "bo1",
      format,
      gameNumber: 1,
      unavailableChampionIds: [],
    },
    redTeam: createDraftTeamForSide({
      career,
      match,
      side: "red",
      userTeamId,
    }),
  });
}

export function createLiveMatchPresentationFromCareer(
  career: CareerSave | null,
): LiveMatchPresentation {
  const match = getPrimaryPreviewMatch(career);
  const userTeamId = getLiveMatchUserTeamId(career);
  const format = match?.format ?? "bo3";
  const generatedDraft = createLiveMatchDraftSummary({
    career,
    format,
    match,
    userTeamId,
  });
  let blueTeam = createMockLiveMatchTeam({
    career,
    match,
    side: "blue",
    userTeamId,
  });
  let redTeam = createMockLiveMatchTeam({
    career,
    match,
    side: "red",
    userTeamId,
  });
  let draft = mockLiveMatchDraft;

  if (generatedDraft) {
    const draftedTeams = applyDraftToLiveMatchTeams({
      blueTeam,
      draft: generatedDraft,
      redTeam,
    });

    blueTeam = draftedTeams.blueTeam;
    redTeam = draftedTeams.redTeam;
    draft = createLiveMatchDraftFromSummary({
      draft: generatedDraft,
      format,
      usedChampionIdsByGame: [getDraftPickChampionIds(generatedDraft)],
    });
  }

  const formatLabel = format.toUpperCase();
  const stageName = match?.stageName ?? "LCK Cup Group Battle";

  return {
    currentSet: {
      blueTeam,
      draft,
      gameNumber: 1,
      gameTime: "28:34",
      redTeam,
      stageName,
      timelineEvents: mockLiveMatchTimelineEvents,
    },
    formatLabel,
    id: match?.id ?? "mock-live-match",
    stageName,
  };
}
