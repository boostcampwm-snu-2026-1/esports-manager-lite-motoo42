type StatPillProps = {
  label: string;
  value: number | string;
};

export function StatPill({ label, value }: StatPillProps) {
  return (
    <span className="stat-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </span>
  );
}
