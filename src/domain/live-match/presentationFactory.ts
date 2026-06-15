import { getPreviewMatches, getReviewRecords } from "../season/progressSeason";
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
import { buildNarrationContext } from "./liveSnapshotAdapter";
import {
  createSetTimeline,
  liveMatchOutcomeFromRecord,
  standInOutcomeFromDraftPower,
} from "./liveSetTimeline";
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

// The just-played user match, if any. Present once the match simulation has run
// (progress status "match-review"), and it is what step 7 replays.
function getPrimaryReviewResult(career: CareerSave | null) {
  if (!career || career.seasonState.progressStatus !== "match-review") {
    return undefined;
  }

  const userTeamId = getLiveMatchUserTeamId(career);

  for (const record of getReviewRecords(career.seasonState)) {
    const schedule = career.seasonState.scheduledMatches.find(
      (match) => match.id === record.scheduleId,
    );

    if (
      schedule &&
      (schedule.blueTeamId === userTeamId || schedule.redTeamId === userTeamId)
    ) {
      return { record, schedule };
    }
  }

  return undefined;
}

// Stable id for the current live-match set — the played record's id (frozen for
// the replay), else the upcoming match id, else the prototype key. Used to
// memoize the presentation so career changes mid-replay don't rebuild the
// timeline (which would reset playback).
export function getLiveMatchSetId(career: CareerSave | null): string {
  const reviewResult = getPrimaryReviewResult(career);

  if (reviewResult) {
    return reviewResult.record.id;
  }

  return getPrimaryPreviewMatch(career)?.id ?? "mock-live-match";
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
  const reviewResult = getPrimaryReviewResult(career);
  const match = reviewResult?.schedule ?? getPrimaryPreviewMatch(career);
  const userTeamId = getLiveMatchUserTeamId(career);
  const format = match?.format ?? "bo3";
  // Use the real banpick from the played match when available; otherwise the
  // prototype stand-in draft.
  const generatedDraft =
    reviewResult?.record.draft ??
    createLiveMatchDraftSummary({
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
  // Real result replays the decided match (frozen by record id); otherwise the
  // draft-power stand-in keyed by the schedule id.
  const outcome = reviewResult
    ? liveMatchOutcomeFromRecord(reviewResult.record)
    : standInOutcomeFromDraftPower({
        netDraftPower: generatedDraft.netDraftPower,
        seed: match?.id ?? "mock-live-match",
      });
  const id = reviewResult?.record.id ?? match?.id ?? "mock-live-match";
  const timeline = createSetTimeline(outcome);
  const narrationContext = buildNarrationContext({ blueTeam, redTeam });

  return {
    currentSet: {
      blueTeam,
      draft,
      gameNumber: 1,
      gameTime: "00:00",
      redTeam,
      stageName,
      timelineEvents: mockLiveMatchTimelineEvents,
    },
    formatLabel,
    id,
    narrationContext,
    stageName,
    timeline,
  };
}
