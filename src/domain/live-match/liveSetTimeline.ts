import {
  dominanceFromWinnerWinProbability,
  generateMatchTimeline,
  type GeneratedMatchTimeline,
} from "./matchTimeline";
import type { LiveMatchSide } from "./types";

// The single seam between "what decided the game" and "how we replay it". In the
// prototype this outcome is a stand-in derived from draft power; in step 7 (D) it
// is built from the real SeriesResult (winner + win probability). Keeping it here
// means swapping the source later touches only the construction of this object.

export type LiveMatchOutcome = {
  // Pre-game win chance of the team that actually won, on a 0..1 scale. Used to
  // size the replay's dominance so an upset stays close, not a blowout.
  winnerWinProbability: number;
  seed: string;
  winningSide: LiveMatchSide;
};

const STANDIN_MIN_WIN_PROBABILITY = 0.55;
const STANDIN_WIN_PROBABILITY_RANGE = 0.15;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

// Prototype stand-in: until step 7 feeds the real SeriesResult, derive an outcome
// from draft power alone. The winner is the better-drafting side; the win chance
// stays in a gentle 0.55..0.70 band so dominance never reads as a blowout from
// draft power alone (netDraftPower already ranges -10..10).
export function standInOutcomeFromDraftPower({
  netDraftPower,
  seed,
}: {
  netDraftPower: number;
  seed: string;
}): LiveMatchOutcome {
  const magnitude = clamp(Math.abs(netDraftPower) / 10, 0, 1);
  const winnerWinProbability =
    STANDIN_MIN_WIN_PROBABILITY + magnitude * STANDIN_WIN_PROBABILITY_RANGE;

  return {
    seed,
    // Round to drop float artifacts (0.55 + 0.15 -> 0.7000000000000001).
    winnerWinProbability: Math.round(winnerWinProbability * 1000) / 1000,
    winningSide: netDraftPower >= 0 ? "blue" : "red",
  };
}

export function createSetTimeline(
  outcome: LiveMatchOutcome,
): GeneratedMatchTimeline {
  return generateMatchTimeline({
    dominance: dominanceFromWinnerWinProbability(outcome.winnerWinProbability),
    seed: outcome.seed,
    winningSide: outcome.winningSide,
  });
}
