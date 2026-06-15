import { describe, expect, it } from "vitest";
import {
  generateMatchTimeline,
  matchTimelineRoles,
  toMatchDominance,
  type GeneratedMatchTimeline,
} from "../../src/domain/live-match/matchTimeline";
import type { LiveMatchSide } from "../../src/domain/live-match/types";

function killEvents(timeline: GeneratedMatchTimeline) {
  return timeline.events.filter((event) => event.type === "kill");
}

function deathsBySide(timeline: GeneratedMatchTimeline) {
  // A kill that benefits one side is a death for the other side.
  const deaths: Record<LiveMatchSide, number> = { blue: 0, red: 0 };

  for (const event of killEvents(timeline)) {
    deaths[event.side === "blue" ? "red" : "blue"] += 1;
  }

  return deaths;
}

describe("match timeline generator", () => {
  it("is deterministic for the same seed", () => {
    const first = generateMatchTimeline({ seed: "match-a", winningSide: "blue" });
    const second = generateMatchTimeline({ seed: "match-a", winningSide: "blue" });

    expect(second).toEqual(first);
  });

  it("produces different timelines for different seeds", () => {
    const first = generateMatchTimeline({ seed: "match-a", winningSide: "blue" });
    const second = generateMatchTimeline({ seed: "match-b", winningSide: "blue" });

    expect(second.events).not.toEqual(first.events);
  });

  it("keeps blue kills equal to red deaths (and vice versa)", () => {
    for (const seed of ["s1", "s2", "s3", "s4", "s5"]) {
      const timeline = generateMatchTimeline({ seed, winningSide: "red" });
      const deaths = deathsBySide(timeline);

      expect(timeline.finalKills.blue).toBe(deaths.red);
      expect(timeline.finalKills.red).toBe(deaths.blue);
    }
  });

  it("lets the winning side finish ahead on kills and take the nexus last", () => {
    for (const seed of ["s1", "s2", "s3", "s4", "s5", "s6"]) {
      for (const winningSide of ["blue", "red"] as LiveMatchSide[]) {
        const timeline = generateMatchTimeline({ seed, winningSide, dominance: 0.4 });
        const last = timeline.events[timeline.events.length - 1];

        expect(timeline.finalKills[winningSide]).toBeGreaterThan(
          timeline.finalKills[winningSide === "blue" ? "red" : "blue"],
        );
        expect(last.type).toBe("nexus");
        expect(last.side).toBe(winningSide);
      }
    }
  });

  it("keeps the team assist-to-kill ratio roughly between 2 and 3", () => {
    for (const seed of ["r1", "r2", "r3", "r4", "r5"]) {
      const timeline = generateMatchTimeline({ seed, winningSide: "blue", dominance: 0.3 });
      const kills = killEvents(timeline);
      const assists = kills.reduce(
        (total, event) => total + (event.kill?.assistRoles.length ?? 0),
        0,
      );
      const ratio = assists / kills.length;

      expect(ratio).toBeGreaterThanOrEqual(1.9);
      expect(ratio).toBeLessThanOrEqual(3.2);
    }
  });

  it("only ever assigns the five known roles to kill participants", () => {
    const timeline = generateMatchTimeline({ seed: "roles", winningSide: "red" });

    for (const event of killEvents(timeline)) {
      const roles = [
        event.kill!.killerRole,
        event.kill!.victimRole,
        ...event.kill!.assistRoles,
      ];

      for (const role of roles) {
        expect(matchTimelineRoles).toContain(role);
      }
    }

    // Solo kills carry no assists; teamfight kills carry 1-4.
    for (const event of killEvents(timeline)) {
      if (event.kill!.isSolo) {
        expect(event.kill!.assistRoles).toHaveLength(0);
      } else {
        expect(event.kill!.assistRoles.length).toBeGreaterThanOrEqual(1);
        expect(event.kill!.assistRoles.length).toBeLessThanOrEqual(4);
      }
    }
  });

  it("compresses dominant wins and stretches close games into the right bands", () => {
    const stomp = generateMatchTimeline({ seed: "len", winningSide: "blue", dominance: 0.8 });
    const close = generateMatchTimeline({ seed: "len", winningSide: "blue", dominance: 0.05 });

    expect(stomp.durationSec).toBeLessThanOrEqual(30 * 60);
    expect(close.durationSec).toBeGreaterThanOrEqual(36 * 60);
  });

  it("always ends with a visible closing push (tower/inhibitor/nexus) in the final minutes", () => {
    for (const seed of ["c1", "c2", "c3"]) {
      const timeline = generateMatchTimeline({ seed, winningSide: "red", dominance: 0.4 });
      const closingWindowStart = timeline.durationSec - 180;
      const closingVisible = timeline.events.filter(
        (event) => event.visible && event.timeSec >= closingWindowStart,
      );

      expect(closingVisible.some((event) => event.type === "nexus")).toBe(true);
      expect(closingVisible.some((event) => event.type === "inhibitor")).toBe(true);
    }
  });

  it("surfaces only a subset of events while keeping every critical moment visible", () => {
    const timeline = generateMatchTimeline({ seed: "vis", winningSide: "blue", dominance: 0.4 });
    const visible = timeline.events.filter((event) => event.visible);

    expect(visible.length).toBeLessThan(timeline.events.length);

    for (const event of timeline.events) {
      if (event.importance === "critical") {
        expect(event.visible).toBe(true);
      }
    }
  });

  it("maps win probability to a 0..1 dominance scale", () => {
    expect(toMatchDominance(0.5)).toBe(0);
    expect(toMatchDominance(1)).toBe(1);
    expect(toMatchDominance(0)).toBe(1);
    expect(toMatchDominance(0.75)).toBeCloseTo(0.5, 5);
  });
});
