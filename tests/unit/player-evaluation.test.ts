import { describe, expect, it } from "vitest";
import { lck2026Players } from "../../src/data/lck2026Players";
import {
  calculatePlayerEvaluation,
  createNextEvaluationStatus,
  getEvaluationStarsFromScore,
  getPlayerEvaluation,
  smoothEvaluationForm,
} from "../../src/domain/players";

describe("player evaluation", () => {
  it("maps evaluation scores to half-star public ratings without a 100 cap", () => {
    expect(getEvaluationStarsFromScore(61)).toBe(0.5);
    expect(getEvaluationStarsFromScore(62)).toBe(1);
    expect(getEvaluationStarsFromScore(67)).toBe(1.5);
    expect(getEvaluationStarsFromScore(71)).toBe(2);
    expect(getEvaluationStarsFromScore(75)).toBe(2.5);
    expect(getEvaluationStarsFromScore(79)).toBe(3);
    expect(getEvaluationStarsFromScore(83)).toBe(3.5);
    expect(getEvaluationStarsFromScore(86)).toBe(4);
    expect(getEvaluationStarsFromScore(89)).toBe(4.5);
    expect(getEvaluationStarsFromScore(92)).toBe(5);
    expect(getEvaluationStarsFromScore(108)).toBe(5);
  });

  it("keeps Chovy in the top public evaluation band", () => {
    const chovy = lck2026Players.find((player) => player.name === "Chovy");

    expect(chovy).toBeDefined();
    expect(getPlayerEvaluation(chovy!).stars).toBe(5);
  });

  it("smooths form for UI evaluation instead of mirroring the raw form instantly", () => {
    expect(smoothEvaluationForm(80, 40)).toBe(74);
    expect(smoothEvaluationForm(undefined, 40)).toBe(40);
  });

  it("uses hysteresis near star boundaries without permanently fixing the star value", () => {
    expect(getEvaluationStarsFromScore(89.4, 4)).toBe(4);
    expect(getEvaluationStarsFromScore(90.1, 4)).toBe(4.5);
    expect(getEvaluationStarsFromScore(91.2, 5)).toBe(5);
    expect(getEvaluationStarsFromScore(90.8, 5)).toBe(4.5);
  });

  it("stores smoothed evaluation fields when player status changes", () => {
    const player = {
      ...lck2026Players.find((candidate) => candidate.name === "Faker")!,
      status: {
        ...lck2026Players.find((candidate) => candidate.name === "Faker")!.status,
        form: 80,
        evaluationForm: 80,
        evaluationStars: 4.5,
      },
    };
    const nextStatus = createNextEvaluationStatus(player, {
      ...player.status,
      form: 40,
    });
    const nextEvaluation = calculatePlayerEvaluation(player, nextStatus);

    expect(nextStatus.evaluationForm).toBe(74);
    expect(nextStatus.evaluationStars).toBe(nextEvaluation.stars);
  });
});
