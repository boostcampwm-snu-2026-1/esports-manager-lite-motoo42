import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  getDisplayDurationForSpeed,
  gameTimeAtProgress,
  getRevealedEvents,
  type MatchCommentaryFrequency,
  type MatchPlaybackSpeed,
} from "../../domain/live-match/livePlaybackModel";
import {
  getMatchSnapshotAt,
  type MatchStatSnapshot,
} from "../../domain/live-match/matchStats";
import type {
  GeneratedMatchTimeline,
  MatchTimelineEvent,
} from "../../domain/live-match/matchTimeline";

const TICK_MS = 50;

export type MatchPlaybackStatus = "idle" | "playing" | "paused" | "finished";

export type MatchPlayback = {
  durationSec: number;
  frequency: MatchCommentaryFrequency;
  gameTimeSec: number;
  isPlaying: boolean;
  pause: () => void;
  play: () => void;
  revealedEvents: MatchTimelineEvent[];
  seek: (gameTimeSec: number) => void;
  setFrequency: (frequency: MatchCommentaryFrequency) => void;
  setSpeed: (speed: MatchPlaybackSpeed) => void;
  skipToEnd: () => void;
  snapshot: MatchStatSnapshot;
  speed: MatchPlaybackSpeed;
  status: MatchPlaybackStatus;
  toggle: () => void;
};

type UseMatchPlaybackOptions = {
  autoPlay?: boolean;
  initialFrequency?: MatchCommentaryFrequency;
  onComplete?: () => void;
  timeline: GeneratedMatchTimeline;
};

export function useMatchPlayback({
  autoPlay = true,
  initialFrequency = "major",
  onComplete,
  timeline,
}: UseMatchPlaybackOptions): MatchPlayback {
  const durationSec = timeline.durationSec;
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<MatchPlaybackStatus>(
    autoPlay ? "playing" : "idle",
  );
  const [speed, setSpeedState] = useState<MatchPlaybackSpeed>("normal");
  const [frequency, setFrequency] = useState<MatchCommentaryFrequency>(
    initialFrequency,
  );

  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const displayDurationMs = getDisplayDurationForSpeed(durationSec, speed);

  useEffect(() => {
    if (status !== "playing") {
      return;
    }

    if (displayDurationMs <= 0) {
      setProgress(1);
      setStatus("finished");
      return;
    }

    const id = setInterval(() => {
      setProgress((previous) => {
        const next = previous + TICK_MS / displayDurationMs;
        return next >= 1 ? 1 : next;
      });
    }, TICK_MS);

    return () => clearInterval(id);
  }, [status, displayDurationMs]);

  useEffect(() => {
    if (status === "playing" && progress >= 1) {
      setStatus("finished");
    }
  }, [progress, status]);

  useEffect(() => {
    if (status === "finished") {
      onCompleteRef.current?.();
    }
  }, [status]);

  const gameTimeSec =
    status === "finished" ? durationSec : gameTimeAtProgress(progress, durationSec);

  const snapshot = useMemo(
    () => getMatchSnapshotAt(timeline, gameTimeSec),
    [timeline, gameTimeSec],
  );
  const revealedEvents = useMemo(
    () => getRevealedEvents(timeline, gameTimeSec, frequency),
    [timeline, gameTimeSec, frequency],
  );

  const play = useCallback(() => {
    setStatus((current) => (current === "finished" ? current : "playing"));
  }, []);

  const pause = useCallback(() => {
    setStatus((current) => (current === "playing" ? "paused" : current));
  }, []);

  const toggle = useCallback(() => {
    setStatus((current) => {
      if (current === "playing") {
        return "paused";
      }

      return current === "finished" ? current : "playing";
    });
  }, []);

  const seek = useCallback(
    (targetSec: number) => {
      const clamped = Math.max(0, Math.min(durationSec, targetSec));

      setProgress(durationSec === 0 ? 1 : clamped / durationSec);
      setStatus(clamped >= durationSec ? "finished" : "paused");
    },
    [durationSec],
  );

  const skipToEnd = useCallback(() => {
    setProgress(1);
    setStatus("finished");
  }, []);

  const setSpeed = useCallback((next: MatchPlaybackSpeed) => {
    setSpeedState(next);
  }, []);

  return {
    durationSec,
    frequency,
    gameTimeSec,
    isPlaying: status === "playing",
    pause,
    play,
    revealedEvents,
    seek,
    setFrequency,
    setSpeed,
    skipToEnd,
    snapshot,
    speed,
    status,
    toggle,
  };
}
