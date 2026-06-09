import { getPlayerEvaluation } from "../../domain/players";
import type { Player } from "../../types/game";

type EvaluationStarsProps = {
  player?: Player | null;
  value?: number;
  compact?: boolean;
};

function getStarFill(index: number, value: number) {
  const remaining = value - index;

  if (remaining >= 1) {
    return "full";
  }

  if (remaining >= 0.5) {
    return "half";
  }

  return "empty";
}

export function EvaluationStars({
  compact = false,
  player,
  value,
}: EvaluationStarsProps) {
  const stars = value ?? (player ? getPlayerEvaluation(player).stars : 0.5);
  const label = `평가 ${stars.toFixed(1)}성`;

  return (
    <span
      aria-label={label}
      className={`evaluation-stars ${compact ? "evaluation-stars-compact" : ""}`}
      title={label}
    >
      <span className="evaluation-stars-label">평가</span>
      <span className="evaluation-stars-row" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((index) => {
          const fill = getStarFill(index, stars);

          return (
            <span className={`evaluation-star evaluation-star-${fill}`} key={index}>
              <span className="evaluation-star-empty">☆</span>
              {fill !== "empty" && (
                <span className="evaluation-star-fill">★</span>
              )}
            </span>
          );
        })}
      </span>
    </span>
  );
}
