import type { MoraleLevel, Player, PlayerStatus } from "../../types/game";

export type PlayerEvaluation = {
  evaluationForm: number;
  score: number;
  stars: number;
};

const starThresholds: Array<{ min: number; stars: number }> = [
  { min: 92, stars: 5 },
  { min: 89, stars: 4.5 },
  { min: 86, stars: 4 },
  { min: 83, stars: 3.5 },
  { min: 79, stars: 3 },
  { min: 75, stars: 2.5 },
  { min: 71, stars: 2 },
  { min: 67, stars: 1.5 },
  { min: 62, stars: 1 },
  { min: Number.NEGATIVE_INFINITY, stars: 0.5 },
];

const starMinScores = new Map(starThresholds.map((entry) => [entry.stars, entry.min]));

const moraleScore: Record<MoraleLevel, number> = {
  "very-high": 1.8,
  high: 0.9,
  neutral: 0,
  low: -1.1,
  "very-low": -2.2,
};

function clampStars(value: number) {
  return Math.max(0.5, Math.min(5, value));
}

function clampStatusValue(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getNextStarStep(stars: number) {
  return clampStars(stars + 0.5);
}

export function smoothEvaluationForm(previousForm: number | undefined, currentForm: number) {
  const previous = Number.isFinite(previousForm) ? previousForm ?? currentForm : currentForm;

  return clampStatusValue(previous * 0.85 + currentForm * 0.15);
}

export function getPlayerHiddenQuality(player: Player) {
  const detailAverage =
    (player.mechanics +
      player.macro +
      player.laning +
      player.teamfight +
      player.mental +
      player.championPool) /
    6;
  const rawQuality =
    player.ability * 0.38 + player.overall * 0.36 + detailAverage * 0.26;
  const eliteBonus = Math.max(0, rawQuality - 87) * 0.8;

  return rawQuality + eliteBonus;
}

export function getEvaluationStarsFromScore(
  score: number,
  previousStars?: number,
) {
  const targetStars =
    starThresholds.find((entry) => score >= entry.min)?.stars ?? 0.5;

  if (previousStars === undefined || !Number.isFinite(previousStars)) {
    return targetStars;
  }

  const normalizedPrevious = clampStars(Math.round(previousStars * 2) / 2);

  if (targetStars > normalizedPrevious) {
    const nextStep = getNextStarStep(normalizedPrevious);
    const nextThreshold = starMinScores.get(nextStep) ?? Number.POSITIVE_INFINITY;

    return score >= nextThreshold + 1 ? targetStars : normalizedPrevious;
  }

  if (targetStars < normalizedPrevious) {
    const currentThreshold =
      starMinScores.get(normalizedPrevious) ?? Number.NEGATIVE_INFINITY;

    return score < currentThreshold - 1 ? targetStars : normalizedPrevious;
  }

  return targetStars;
}

export function calculatePlayerEvaluation(
  player: Player,
  status: PlayerStatus = player.status,
): PlayerEvaluation {
  const evaluationForm = status.evaluationForm ?? status.form;
  const hiddenQuality = getPlayerHiddenQuality(player);
  const formAdjustment = (evaluationForm - 70) * 0.18;
  const fatiguePenalty = Math.max(0, status.fatigue - 20) * 0.08;
  const score =
    hiddenQuality +
    formAdjustment +
    moraleScore[status.morale] -
    fatiguePenalty;
  const stars = getEvaluationStarsFromScore(score, status.evaluationStars);

  return {
    evaluationForm,
    score,
    stars,
  };
}

export function getPlayerEvaluation(player: Player): PlayerEvaluation {
  const normalizedStatus = ensurePlayerEvaluationStatus(player, player.status);

  return calculatePlayerEvaluation(player, normalizedStatus);
}

export function ensurePlayerEvaluationStatus(
  player: Player,
  status: PlayerStatus = player.status,
): PlayerStatus {
  const evaluationForm = status.evaluationForm ?? status.form;
  const scoreOnlyStatus = {
    ...status,
    evaluationForm,
  };
  const stars =
    status.evaluationStars ??
    getEvaluationStarsFromScore(calculatePlayerEvaluation(player, scoreOnlyStatus).score);

  return {
    ...status,
    evaluationForm,
    evaluationStars: stars,
  };
}

export function createNextEvaluationStatus(
  player: Player,
  nextStatus: PlayerStatus,
): PlayerStatus {
  const evaluationForm = smoothEvaluationForm(
    player.status.evaluationForm,
    nextStatus.form,
  );
  const stabilizedStatus = {
    ...nextStatus,
    evaluationForm,
  };
  const nextEvaluation = calculatePlayerEvaluation(
    {
      ...player,
      status: stabilizedStatus,
    },
    stabilizedStatus,
  );

  return {
    ...stabilizedStatus,
    evaluationStars: getEvaluationStarsFromScore(
      nextEvaluation.score,
      player.status.evaluationStars,
    ),
  };
}
