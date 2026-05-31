import {
  strategyOptions,
  trainingIntensityOptions,
} from "../../domain/weekly-plan";
import type { StrategyId, TrainingIntensity, WeeklyPlan } from "../../types/game";

type StrategyPanelProps = {
  weeklyPlan: WeeklyPlan;
  onStrategyChange: (strategy: StrategyId) => void;
  onTrainingIntensityChange: (trainingIntensity: TrainingIntensity) => void;
};

export function StrategyPanel({
  weeklyPlan,
  onStrategyChange,
  onTrainingIntensityChange,
}: StrategyPanelProps) {
  return (
    <div className="strategy-panel">
      <h3>Weekly plan</h3>
      <div className="option-grid">
        {strategyOptions.map((option) => (
          <button
            className={`option-card ${
              weeklyPlan.strategy === option.id ? "option-card-active" : ""
            }`}
            key={option.id}
            onClick={() => onStrategyChange(option.id)}
            type="button"
          >
            <strong>{option.label}</strong>
            <span>{option.description}</span>
          </button>
        ))}
      </div>
      <h3>Training intensity</h3>
      <div className="option-grid option-grid-compact">
        {trainingIntensityOptions.map((option) => (
          <button
            className={`option-card ${
              weeklyPlan.trainingIntensity === option.id ? "option-card-active" : ""
            }`}
            key={option.id}
            onClick={() => onTrainingIntensityChange(option.id)}
            type="button"
          >
            <strong>{option.label}</strong>
            <span>{option.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
