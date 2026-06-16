import { describe, expect, it } from "vitest";
import {
  computeDisplayDurationMs,
  filterByFrequency,
  frequencyLabel,
  gameTimeAtProgress,
  getDisplayDurationForSpeed,
  getRevealedEvents,
} from "../../src/domain/live-match/livePlaybackModel";
import { standInOutcomeFromDraftPower } from "../../src/domain/live-match/liveSetTimeline";
import { generateMatchTimeline } from "../../src/domain/live-match/matchTimeline";

describe("live playback model", () => {
  it("compresses game length into the 38-65s replay band", () => {
    expect(computeDisplayDurationMs(24 * 60)).toBe(38_000);
    expect(computeDisplayDurationMs(30 * 60)).toBe(45_000);
    expect(computeDisplayDurationMs(60 * 60)).toBe(65_000);
  });

  it("resolves display duration per speed", () => {
    const durationSec = 36 * 60;
    expect(getDisplayDurationForSpeed(durationSec, "normal")).toBe(54_000);
    expect(getDisplayDurationForSpeed(durationSec, "fast")).toBe(25_000);
    expect(getDisplayDurationForSpeed(durationSec, "instant")).toBe(0);
  });

  it("maps progress to a clamped game clock", () => {
    expect(gameTimeAtProgress(0, 2000)).toBe(0);
    expect(gameTimeAtProgress(0.5, 2000)).toBe(1000);
    expect(gameTimeAtProgress(1, 2000)).toBe(2000);
    expect(gameTimeAtProgress(1.5, 2000)).toBe(2000);
    expect(gameTimeAtProgress(-1, 2000)).toBe(0);
  });

  it("maps frequency to its Korean display label", () => {
    expect(frequencyLabel("major")).toBe("주요 상황");
    expect(frequencyLabel("core")).toBe("핵심 상황");
  });

  it("keeps only swing moments under the core frequency", () => {
    const timeline = generateMatchTimeline({
      seed: "freq",
      winningSide: "blue",
      dominance: 0.4,
    });
    const visible = timeline.events.filter((event) => event.visible);
    const major = filterByFrequency(visible, "major");
    const core = filterByFrequency(visible, "core");

    expect(major).toEqual(visible);
    expect(core.length).toBeLessThanOrEqual(major.length);
    expect(
      core.every(
        (event) =>
          event.importance === "high" || event.importance === "critical",
      ),
    ).toBe(true);
  });

  it("reveals only visible events up to the current game time", () => {
    const timeline = generateMatchTimeline({
      seed: "reveal",
      winningSide: "red",
      dominance: 0.4,
    });

    const atStart = getRevealedEvents(timeline, 0, "major");
    const atEnd = getRevealedEvents(timeline, timeline.durationSec, "major");

    expect(atStart.length).toBeLessThan(atEnd.length);
    expect(atEnd.every((event) => event.visible)).toBe(true);
    expect(
      atEnd.every((event) => event.timeSec <= timeline.durationSec),
    ).toBe(true);

    const half = getRevealedEvents(
      timeline,
      Math.round(timeline.durationSec / 2),
      "major",
    );
    expect(half.every((event) => event.timeSec <= timeline.durationSec / 2)).toBe(
      true,
    );
  });
});

describe("draft-power stand-in outcome", () => {
  it("picks the better-drafting side as the winner", () => {
    expect(standInOutcomeFromDraftPower({ netDraftPower: 6, seed: "s" }).winningSide).toBe(
      "blue",
    );
    expect(standInOutcomeFromDraftPower({ netDraftPower: -6, seed: "s" }).winningSide).toBe(
      "red",
    );
    expect(standInOutcomeFromDraftPower({ netDraftPower: 0, seed: "s" }).winningSide).toBe(
      "blue",
    );
  });

  it("keeps the win probability in a gentle 0.55..0.70 band", () => {
    for (const net of [-10, -3, 0, 4, 10]) {
      const outcome = standInOutcomeFromDraftPower({ netDraftPower: net, seed: "s" });
      expect(outcome.winnerWinProbability).toBeGreaterThanOrEqual(0.55);
      expect(outcome.winnerWinProbability).toBeLessThanOrEqual(0.7);
    }

    expect(
      standInOutcomeFromDraftPower({ netDraftPower: 0, seed: "s" }).winnerWinProbability,
    ).toBeCloseTo(0.55, 5);
    expect(
      standInOutcomeFromDraftPower({ netDraftPower: 10, seed: "s" }).winnerWinProbability,
    ).toBeCloseTo(0.7, 5);
  });
});
