import { act, fireEvent, render, screen } from "@testing-library/react";
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

  it("jumps to the result when 세트 결과 is pressed", () => {
    render(<LiveMatchPrototype career={null} onExit={() => {}} />);

    act(() => {
      fireEvent.click(screen.getByText("세트 결과"));
    });

    expect(screen.getByText("넥서스 파괴")).toBeInTheDocument();
  });

  it("filters the feed down to swing moments under 핵심 상황", () => {
    const { container } = render(
      <LiveMatchPrototype career={null} onExit={() => {}} />,
    );

    act(() => {
      fireEvent.click(screen.getByText("세트 결과"));
    });
    const majorCount = container.querySelectorAll(".live-commentary-event").length;

    act(() => {
      fireEvent.click(screen.getByText("핵심 상황"));
    });
    const coreCount = container.querySelectorAll(".live-commentary-event").length;

    expect(coreCount).toBeLessThanOrEqual(majorCount);
  });

  it("pauses playback when 일시정지 is pressed", () => {
    render(<LiveMatchPrototype career={null} onExit={() => {}} />);

    act(() => {
      vi.advanceTimersByTime(6_000);
    });
    act(() => {
      fireEvent.click(screen.getByText("일시정지"));
    });

    expect(screen.getByText("재생")).toBeInTheDocument();
  });
});
