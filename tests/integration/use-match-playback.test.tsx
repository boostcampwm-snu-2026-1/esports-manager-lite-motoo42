import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMatchPlayback } from "../../src/features/live-match/useMatchPlayback";
import { computeDisplayDurationMs } from "../../src/domain/live-match/livePlaybackModel";
import { generateMatchTimeline } from "../../src/domain/live-match/matchTimeline";

const timeline = generateMatchTimeline({
  seed: "hook",
  winningSide: "blue",
  dominance: 0.4,
});

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useMatchPlayback", () => {
  it("auto-plays and advances the game clock over time", () => {
    const { result } = renderHook(() => useMatchPlayback({ timeline }));

    expect(result.current.status).toBe("playing");
    expect(result.current.gameTimeSec).toBe(0);

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(result.current.gameTimeSec).toBeGreaterThan(0);
    expect(result.current.gameTimeSec).toBeLessThan(timeline.durationSec);
  });

  it("reaches the final whistle and fires onComplete once", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useMatchPlayback({ timeline, onComplete }),
    );

    act(() => {
      vi.advanceTimersByTime(computeDisplayDurationMs(timeline.durationSec) + 200);
    });

    expect(result.current.status).toBe("finished");
    expect(result.current.gameTimeSec).toBe(timeline.durationSec);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("stops advancing while paused", () => {
    const { result } = renderHook(() => useMatchPlayback({ timeline }));

    act(() => {
      vi.advanceTimersByTime(8_000);
    });
    act(() => {
      result.current.pause();
    });

    const frozen = result.current.gameTimeSec;

    act(() => {
      vi.advanceTimersByTime(8_000);
    });

    expect(result.current.status).toBe("paused");
    expect(result.current.gameTimeSec).toBe(frozen);
  });

  it("seeks to a requested game time and pauses there", () => {
    const { result } = renderHook(() => useMatchPlayback({ timeline }));
    const target = Math.round(timeline.durationSec * 0.7);

    act(() => {
      result.current.seek(target);
    });

    expect(result.current.status).toBe("paused");
    expect(result.current.gameTimeSec).toBeCloseTo(target, 0);
  });

  it("skips straight to the end on demand", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useMatchPlayback({ timeline, autoPlay: false, onComplete }),
    );

    act(() => {
      result.current.skipToEnd();
    });

    expect(result.current.status).toBe("finished");
    expect(result.current.gameTimeSec).toBe(timeline.durationSec);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("shows fewer commentary events under the core frequency", () => {
    const { result } = renderHook(() => useMatchPlayback({ timeline }));

    act(() => {
      result.current.skipToEnd();
    });

    const majorCount = result.current.revealedEvents.length;

    act(() => {
      result.current.setFrequency("core");
    });

    expect(result.current.frequency).toBe("core");
    expect(result.current.revealedEvents.length).toBeLessThanOrEqual(majorCount);
    expect(
      result.current.revealedEvents.every(
        (event) =>
          event.importance === "high" || event.importance === "critical",
      ),
    ).toBe(true);
  });
});
