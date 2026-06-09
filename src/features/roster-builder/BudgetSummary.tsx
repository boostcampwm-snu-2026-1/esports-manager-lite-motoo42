import { formatSalaryAmount, formatSalaryRange } from "../../shared/format/money";

type BudgetSummaryProps = {
  budget: number;
  spent: number;
};

export function BudgetSummary({ budget, spent }: BudgetSummaryProps) {
  const remaining = budget - spent;

  return (
    <div className="budget-summary">
      <span>Budget</span>
      <strong>
        {formatSalaryRange(spent, budget)}
      </strong>
      <span className={remaining < 0 ? "danger" : "muted"}>
        Remaining: {formatSalaryAmount(remaining)}
      </span>
    </div>
  );
}
