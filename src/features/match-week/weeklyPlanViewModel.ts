import {
  getStrategyEffectSummary,
  getTrainingIntensityPowerBonus,
  getTrainingIntensityStatusSummary,
  strategyOptions,
  trainingIntensityOptions,
} from "../../domain/weekly-plan";
import type { WeeklyPlan } from "../../types/game";

export function getSelectedStrategy(weeklyPlan: WeeklyPlan) {
  return strategyOptions.find((option) => option.id === weeklyPlan.strategy);
}

export function getSelectedTrainingIntensity(weeklyPlan: WeeklyPlan) {
  return trainingIntensityOptions.find(
    (option) => option.id === weeklyPlan.trainingIntensity,
  );
}

export function getWeeklyPlanSummary(weeklyPlan: WeeklyPlan) {
  return {
    strategyEffect: getStrategyEffectSummary(weeklyPlan.strategy),
    trainingPowerBonus: getTrainingIntensityPowerBonus(
      weeklyPlan.trainingIntensity,
    ),
    trainingStatus: getTrainingIntensityStatusSummary(
      weeklyPlan.trainingIntensity,
    ),
  };
}
