import {
  getMoraleLabel,
  moraleRotations,
  moraleTones,
} from "../../domain/player-status";
import type { MoraleLevel } from "../../types/game";

type MoraleIndicatorProps = {
  level: MoraleLevel;
  showLabel?: boolean;
};

export function MoraleIndicator({
  level,
  showLabel = false,
}: MoraleIndicatorProps) {
  const tone = moraleTones[level];
  const label = getMoraleLabel(level);

  return (
    <span
      aria-label={`사기 ${label}`}
      className={`morale-indicator morale-indicator-${tone}`}
      title={`사기 ${label}`}
    >
      <span
        aria-hidden="true"
        className="morale-indicator-arrow"
        style={{ transform: `rotate(${moraleRotations[level]}deg)` }}
      >
        ↑
      </span>
      {showLabel && <span className="morale-indicator-label">{label}</span>}
    </span>
  );
}
