export function formatSalaryAmount(value: number) {
  const roundedValue = Math.round(value);
  const prefix = roundedValue < 0 ? "-" : "";
  const normalizedValue = Math.abs(roundedValue);
  const eok = Math.floor(normalizedValue / 10);
  const cheonman = normalizedValue % 10;

  if (eok === 0 && cheonman === 0) {
    return "0원";
  }

  if (eok === 0) {
    return `${prefix}${cheonman}천만`;
  }

  if (cheonman === 0) {
    return `${prefix}${eok}억`;
  }

  return `${prefix}${eok}억 ${cheonman}천만`;
}

export function formatSalaryRange(spent: number, budget: number) {
  return `${formatSalaryAmount(spent)} / ${formatSalaryAmount(budget)}`;
}
