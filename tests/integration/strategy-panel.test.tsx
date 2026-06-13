import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createInitialCareer } from "../../src/domain/career/createInitialCareer";
import { StrategyPanel } from "../../src/features/match-week/StrategyPanel";

function createCareer() {
  return createInitialCareer("T1", { startMode: "real-roster-lck-cup" });
}

describe("StrategyPanel", () => {
  it("renders the weekly plan summary by default", () => {
    const career = createCareer();

    render(
      <StrategyPanel
        career={career}
        weeklyPlan={{
          strategy: "balanced",
          trainingIntensity: "normal",
        }}
        onStrategyChange={vi.fn()}
        onRequestScrim={vi.fn()}
        onRunTodayScrim={vi.fn()}
      />,
    );

    expect(screen.getByText("주간 계획")).toBeVisible();
    expect(
      screen.getAllByText(/특정 능력치에 크게 기대지 않는/).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("이번 주 스크림")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /템포 지향/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /스크림 요청/i }),
    ).not.toBeInTheDocument();
  });

  it("emits selected strategy changes from the strategy view", () => {
    const career = createCareer();
    const onStrategyChange = vi.fn();

    render(
      <StrategyPanel
        career={career}
        weeklyPlan={{
          strategy: "balanced",
          trainingIntensity: "normal",
        }}
        subPage="strategy"
        onStrategyChange={onStrategyChange}
        onRequestScrim={vi.fn()}
        onRunTodayScrim={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /템포 지향/i }));

    expect(onStrategyChange).toHaveBeenCalledWith("tempo");
    expect(screen.getByRole("heading", { name: "전략" })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /스크림 요청/i }),
    ).not.toBeInTheDocument();
  });

  it("emits scrim requests from the scrim view", () => {
    const career = createCareer();
    const onRequestScrim = vi.fn();

    render(
      <StrategyPanel
        career={career}
        weeklyPlan={{
          strategy: "balanced",
          trainingIntensity: "normal",
        }}
        subPage="scrim"
        onStrategyChange={vi.fn()}
        onRequestScrim={onRequestScrim}
        onRunTodayScrim={vi.fn()}
      />,
    );

    const requestButton = screen.getByRole("button", { name: "스크림 요청" });

    expect(screen.getByRole("heading", { name: "날짜와 상대 선택" })).toBeVisible();
    expect(requestButton).toBeEnabled();
    fireEvent.click(requestButton);

    expect(onRequestScrim).toHaveBeenCalledWith(
      expect.objectContaining({
        matchCount: 3,
      }),
    );
    expect(
      screen.queryByRole("button", { name: /템포 지향/i }),
    ).not.toBeInTheDocument();
  });
});
