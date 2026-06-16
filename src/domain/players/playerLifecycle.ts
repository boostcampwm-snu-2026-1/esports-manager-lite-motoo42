import { createSeededRandom } from "../rng/createSeededRandom";
import type { Player, TrainingIntensity } from "../../types/game";
import { ensurePlayerEvaluationStatus } from "./playerEvaluation";
import { blendPlayerSalaryExpectation, calculatePlayerMarketValue } from "./playerMarketValue";
import { clampStatusValue } from "./playerStatus";

// Overall and ability are the "headline" — they move by exactly the season's overall
// delta so the anchor stays clean. The core skill fields move by the same delta plus
// a small per-field jitter, so development is uneven: a player's stats grow (or
// decline) by different amounts each season instead of shifting perfectly flat.
const headlineRatingFields = ["overall", "ability"] as const;
const coreRatingFields = [
  "mechanics",
  "macro",
  "laning",
  "teamfight",
  "mental",
  "championPool",
] as const;

const seasonVarianceSpread = 1.2; // ± seeded breakout / slump on the headline delta
const fieldJitterSpread = 0.8; // ± unevenness across the core skill fields
const maxSeasonSwing = 4; // cap on a single season's overall movement

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function clampRating(value: number) {
  return Math.max(45, Math.min(95, Math.round(value)));
}

// No per-player appearance tracking exists, so rosterTier stands in for playing time:
// main-roster regulars develop fastest and age slowest; players without a team
// stagnate and decline quicker.
function growthUsageMultiplier(player: Player) {
  if (player.rosterTier === "main") {
    return 1.15;
  }

  if (player.rosterTier === "academy") {
    return 0.9;
  }

  return 0.5;
}

function declineUsageMultiplier(player: Player) {
  if (player.rosterTier === "main") {
    return 0.85;
  }

  if (player.rosterTier === "academy") {
    return 1;
  }

  return 1.25;
}

// Training intensity only nudges growth, and only for the user's own players (the
// only roster whose training the manager actually controls). Decline can't be
// trained away.
function trainingGrowthBonus(trainingIntensity: TrainingIntensity | undefined) {
  switch (trainingIntensity) {
    case "high":
      return 0.6;
    case "light":
      return -0.2;
    case "rest":
      return -0.5;
    default:
      return 0;
  }
}

// Signed, fractional base delta from the age curve (no premature rounding so the
// usage / training / variance modifiers can act on the real magnitude).
function getAgeCurveDelta(player: Player) {
  if (player.age < player.development.peakAgeStart) {
    const growthRoom = Math.max(0, player.potential - player.overall);

    return growthRoom * (player.development.growthRate / 100) * 0.25;
  }

  if (player.age > player.development.peakAgeEnd) {
    return -Math.max(1, player.development.declineRate / 6);
  }

  return 0;
}

type SeasonDevelopmentOptions = {
  // Set only for the user's own players, whose training the manager controls.
  trainingIntensity?: TrainingIntensity;
};

function resolveOverallDelta(
  player: Player,
  options: SeasonDevelopmentOptions,
  random: () => number,
) {
  const variance = (random() - 0.5) * 2 * seasonVarianceSpread;
  const base = getAgeCurveDelta(player);

  if (base > 0) {
    const raw =
      base * growthUsageMultiplier(player) +
      trainingGrowthBonus(options.trainingIntensity) +
      variance;

    return clamp(Math.round(raw), 0, maxSeasonSwing);
  }

  if (base < 0) {
    const raw = base * declineUsageMultiplier(player) + variance;

    // Past peak a player always loses at least 1; a lucky roll only softens it.
    return clamp(Math.round(raw), -maxSeasonSwing, -1);
  }

  // Peak years: only a tiny seeded ripple, so stats aren't perfectly frozen.
  return Math.round(variance * 0.5);
}

function applySeasonDevelopment(
  player: Player,
  options: SeasonDevelopmentOptions,
  nextAge: number,
): Player {
  // Deterministic per (player, season): the seed includes the new age, so each
  // season re-rolls but the same save always replays identically.
  const random = createSeededRandom(`${player.id}:dev:s${nextAge}`);
  const overallDelta = resolveOverallDelta(player, options, random);

  if (overallDelta === 0) {
    return player;
  }

  const moveField = (current: number, delta: number) => {
    const next = clampRating(current + delta);

    return overallDelta > 0 ? Math.min(player.potential, next) : next;
  };

  let nextPlayer = player;

  for (const field of headlineRatingFields) {
    nextPlayer = {
      ...nextPlayer,
      [field]: moveField(nextPlayer[field], overallDelta),
    };
  }

  for (const field of coreRatingFields) {
    const jitter = (random() - 0.5) * 2 * fieldJitterSpread;
    nextPlayer = {
      ...nextPlayer,
      [field]: moveField(nextPlayer[field], overallDelta + jitter),
    };
  }

  return nextPlayer;
}

export function rollPlayerIntoNextSeason(
  player: Player,
  options: SeasonDevelopmentOptions = {},
): Player {
  const nextAge = player.age + 1;
  const ratingUpdatedPlayer = applySeasonDevelopment(player, options, nextAge);
  const marketValue = calculatePlayerMarketValue(ratingUpdatedPlayer);
  const salaryExpectation = blendPlayerSalaryExpectation(
    ratingUpdatedPlayer.salaryExpectation,
    marketValue,
    ratingUpdatedPlayer,
  );

  const nextStatus = {
    ...ratingUpdatedPlayer.status,
    form: clampStatusValue((ratingUpdatedPlayer.status.form + 50) / 2),
    evaluationForm: undefined,
    evaluationStars: undefined,
    fatigue: 0,
    morale: "neutral" as const,
  };
  const nextPlayer = {
    ...ratingUpdatedPlayer,
    age: nextAge,
    cost: salaryExpectation,
    salaryExpectation,
    retirementCandidate: player.retirementAge
      ? nextAge >= player.retirementAge
      : player.retirementCandidate,
    status: nextStatus,
    marketProfile: {
      ...ratingUpdatedPlayer.marketProfile,
      buyoutEstimate: Math.round(salaryExpectation * 2.4),
    },
  };

  return {
    ...nextPlayer,
    status: ensurePlayerEvaluationStatus(nextPlayer, nextStatus),
  };
}
