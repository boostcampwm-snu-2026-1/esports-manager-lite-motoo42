import { describe, expect, it } from "vitest";
import { formatSalaryAmount, formatSalaryRange } from "../../src/shared/format/money";

describe("money formatter", () => {
  it("formats internal salary units as Korean salary labels", () => {
    expect(formatSalaryAmount(130)).toBe("13억");
    expect(formatSalaryAmount(105)).toBe("10억 5천만");
    expect(formatSalaryAmount(36)).toBe("3억 6천만");
    expect(formatSalaryAmount(4)).toBe("4천만");
    expect(formatSalaryAmount(-12)).toBe("-1억 2천만");
  });

  it("formats spent and budget pairs", () => {
    expect(formatSalaryRange(105, 130)).toBe("10억 5천만 / 13억");
  });
});
