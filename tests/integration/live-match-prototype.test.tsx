import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LiveMatchPrototype } from "../../src/features/live-match/LiveMatchPrototype";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("LiveMatchPrototype", () => {
  it("plays an engine-driven match and reveals commentary over time", () => {
    const { container } = render(
      <LiveMatchPrototype career={null} onExit={() => {}} />,
    );

    act(() => {
      vi.advanceTimersByTime(2_000);
    });
    const earlyCount = container.querySelectorAll(".live-commentary-event").length;

    act(() => {
      vi.advanceTimersByTime(70_000);
    });
    const lateCount = container.querySelectorAll(".live-commentary-event").length;

    expect(lateCount).toBeGreaterThan(earlyCount);
    // The mandatory closing nexus is reached and narrated by the end.
    expect(screen.getByText("넥서스 파괴")).toBeInTheDocument();
  });

  it("renders a live 10-player stat board with KDA after playback", () => {
    const { container } = render(
      <LiveMatchPrototype career={null} onExit={() => {}} />,
    );

    act(() => {
      vi.advanceTimersByTime(70_000);
    });

    const rows = container.querySelectorAll(".live-player-row");
    expect(rows).toHaveLength(10);
  });
});
