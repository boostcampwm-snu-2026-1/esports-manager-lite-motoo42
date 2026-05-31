import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import type {
  MatchResult,
  Opponent,
  StrategyId,
  TrainingIntensity,
  WeeklyPlan,
} from "../../types/game";
import { MatchResultPanel } from "./MatchResultPanel";
import { StrategyPanel } from "./StrategyPanel";

type MatchWeekProps = {
  opponent: Opponent;
  result: MatchResult | null;
  weeklyPlan: WeeklyPlan;
  onStrategyChange: (strategy: StrategyId) => void;
  onTrainingIntensityChange: (trainingIntensity: TrainingIntensity) => void;
  onSimulate: () => void;
  onViewCalendar: () => void;
};

export function MatchWeek({
  opponent,
  result,
  weeklyPlan,
  onStrategyChange,
  onTrainingIntensityChange,
  onSimulate,
  onViewCalendar,
}: MatchWeekProps) {
  return (
    <section className="stack">
      <header>
        <p className="eyebrow">Match week</p>
        <h1>Prepare for {opponent.name}</h1>
        <p className="lede">
          This first slice connects roster choices to a seeded match simulation.
        </p>
      </header>

      <div className="two-column">
        <Card>
          <h2>Opponent report</h2>
          <p>{opponent.leagueLabel}</p>
          <p>Style: {opponent.style}</p>
          <p>Strength: {opponent.strength}</p>
          <StrategyPanel
            weeklyPlan={weeklyPlan}
            onStrategyChange={onStrategyChange}
            onTrainingIntensityChange={onTrainingIntensityChange}
          />
          <Button onClick={onSimulate}>Simulate match</Button>
        </Card>

        <MatchResultPanel result={result} onViewCalendar={onViewCalendar} />
      </div>
    </section>
  );
}
