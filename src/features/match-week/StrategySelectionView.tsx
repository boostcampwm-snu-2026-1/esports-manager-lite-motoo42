import { strategyOptions } from "../../domain/weekly-plan";
import type { StrategyId, WeeklyPlan } from "../../types/game";
import { getSelectedStrategy } from "./weeklyPlanViewModel";

type StrategySelectionViewProps = {
  weeklyPlan: WeeklyPlan;
  onStrategyChange: (strategy: StrategyId) => void;
};

export function StrategySelectionView({
  weeklyPlan,
  onStrategyChange,
}: StrategySelectionViewProps) {
  const selectedStrategy = getSelectedStrategy(weeklyPlan);

  return (
    <div className="strategy-panel strategy-panel-selection">
      <section className="strategy-page-context">
        <p className="eyebrow">전략 선택</p>
        <h3>전략</h3>
        <p>
          다음 경기에서 우선할 팀 운영 방향을 고릅니다. 스크림은 별도 메뉴에서
          날짜와 상대를 선택해 경기 감각을 조정할 수 있습니다.
        </p>
        <span>현재 전략: {selectedStrategy?.label ?? "균형 전술"}</span>
      </section>

      <section className="strategy-subsection strategy-subsection-active">
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
              <small>{option.effectSummary}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
