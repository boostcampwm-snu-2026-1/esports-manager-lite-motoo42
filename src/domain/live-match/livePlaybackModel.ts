import type {
  GeneratedMatchTimeline,
  MatchTimelineEvent,
} from "./matchTimeline";

// Pure playback math for the live-match replay. The React hook drives a timer
// over these helpers; keeping the time/reveal/filter logic here makes it all
// deterministic and unit-testable without a DOM.

export type MatchPlaybackSpeed = "normal" | "fast" | "instant";
export type MatchCommentaryFrequency = "major" | "core";

const FAST_DISPLAY_MS = 25_000;
const MIN_DISPLAY_MS = 38_000;
const MAX_DISPLAY_MS = 65_000;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

// Compress the internal game length into a 38-65s replay:
// displayMs = clamp(gameMinutes * 1500, 38000, 65000) = clamp(gameSec * 25, ...).
export function computeDisplayDurationMs(durationSec: number): number {
  return clamp(durationSec * 25, MIN_DISPLAY_MS, MAX_DISPLAY_MS);
}

export function getDisplayDurationForSpeed(
  durationSec: number,
  speed: MatchPlaybackSpeed,
): number {
  if (speed === "instant") {
    return 0;
  }

  if (speed === "fast") {
    return Math.min(FAST_DISPLAY_MS, computeDisplayDurationMs(durationSec));
  }

  return computeDisplayDurationMs(durationSec);
}

// Map replay progress (0..1) to a game-clock second. Kept progress-based so a
// mid-replay speed change doesn't jump the clock.
export function gameTimeAtProgress(progress: number, durationSec: number): number {
  return clamp(progress, 0, 1) * durationSec;
}

export function frequencyLabel(frequency: MatchCommentaryFrequency): string {
  return frequency === "core" ? "핵심 상황" : "주요 상황";
}

// "주요 상황" surfaces every commentary-worthy moment; "핵심 상황" keeps only the
// swing moments (high/critical importance).
export function filterByFrequency(
  events: MatchTimelineEvent[],
  frequency: MatchCommentaryFrequency,
): MatchTimelineEvent[] {
  if (frequency === "major") {
    return events;
  }

  return events.filter(
    (event) => event.importance === "high" || event.importance === "critical",
  );
}

export function getRevealedEvents(
  timeline: GeneratedMatchTimeline,
  gameTimeSec: number,
  frequency: MatchCommentaryFrequency,
): MatchTimelineEvent[] {
  const surfaced = timeline.events.filter(
    (event) => event.visible && event.timeSec <= gameTimeSec,
  );

  return filterByFrequency(surfaced, frequency);
}
