import type { TrainingSubPage } from "../../app/routes";
import type { CareerSave, StrategyId, WeeklyPlan } from "../../types/game";
import type { ScrimRequestInput } from "../../domain/scrim";
import { ScrimView } from "./ScrimView";
import { StrategySelectionView } from "./StrategySelectionView";
import { WeeklyPlanView } from "./WeeklyPlanView";

type StrategyPanelProps = {
  subPage?: TrainingSubPage | null;
  career: CareerSave;
  weeklyPlan: WeeklyPlan;
  onStrategyChange: (strategy: StrategyId) => void;
  onRequestScrim: (request: ScrimRequestInput) => void;
  onRunTodayScrim: () => void;
};

export function StrategyPanel({
  subPage,
  career,
  weeklyPlan,
  onStrategyChange,
  onRequestScrim,
  onRunTodayScrim,
}: StrategyPanelProps) {
  if (subPage === "strategy") {
    return (
      <StrategySelectionView
        weeklyPlan={weeklyPlan}
        onStrategyChange={onStrategyChange}
      />
    );
  }

  if (subPage === "scrim") {
    return (
      <ScrimView
        career={career}
        onRequestScrim={onRequestScrim}
        onRunTodayScrim={onRunTodayScrim}
      />
    );
  }

  return <WeeklyPlanView career={career} weeklyPlan={weeklyPlan} />;
}
