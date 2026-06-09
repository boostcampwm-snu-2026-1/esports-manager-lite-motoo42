import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StrategyPanel } from "../../src/features/match-week/StrategyPanel";

describe("StrategyPanel", () => {
  it("emits selected strategy and training intensity changes", () => {
    const onStrategyChange = vi.fn();
    const onTrainingIntensityChange = vi.fn();

    render(
      <StrategyPanel
        weeklyPlan={{
          strategy: "balanced",
          trainingIntensity: "normal",
        }}
        onStrategyChange={onStrategyChange}
        onTrainingIntensityChange={onTrainingIntensityChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /템포 지향/i }));
    fireEvent.click(screen.getByRole("button", { name: /고강도 훈련/i }));

    expect(onStrategyChange).toHaveBeenCalledWith("tempo");
    expect(onTrainingIntensityChange).toHaveBeenCalledWith("high");
  });
});
