import { describe, expect, it } from "vitest";
import { createInitialCareer } from "../../src/domain/career/createInitialCareer";
import {
  getStrategyLabel,
  getTrainingIntensityPowerBonus,
  strategyOptions,
  trainingIntensityOptions,
} from "../../src/domain/weekly-plan";

describe("weekly plan options", () => {
  it("starts a career with the default balanced normal weekly plan", () => {
    const career = createInitialCareer("T1");

    expect(career.weeklyPlan).toEqual({
      strategy: "balanced",
      trainingIntensity: "normal",
    });
  });

  it("keeps the approved six strategies and four training intensities", () => {
    expect(strategyOptions.map((option) => option.id)).toEqual([
      "aggressive",
      "tempo",
      "macro",
      "vision",
      "scaling",
      "balanced",
    ]);
    expect(trainingIntensityOptions.map((option) => option.id)).toEqual([
      "high",
      "normal",
      "light",
      "rest",
    ]);
  });

  it("maps labels and training power bonuses", () => {
    expect(getStrategyLabel("vision")).toBe("시야 중심형");
    expect(getTrainingIntensityPowerBonus("high")).toBe(3);
    expect(getTrainingIntensityPowerBonus("rest")).toBe(0);
  });
});
