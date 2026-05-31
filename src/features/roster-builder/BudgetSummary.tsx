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
        {spent} / {budget}
      </strong>
      <span className={remaining < 0 ? "danger" : "muted"}>
        Remaining: {remaining}
      </span>
    </div>
  );
}
