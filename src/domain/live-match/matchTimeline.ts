import { createSeededRandom } from "../rng/createSeededRandom";
import type { Role } from "../../types/game";
import type {
  LiveMatchEventAdvantage,
  LiveMatchImportance,
  LiveMatchSide,
} from "./types";

// Internal match timeline = the structural source of truth for the live-match
// presentation layer. It is generated procedurally from an already-decided
// match result (winning side + how dominant the win was) so the replay never
// contradicts the existing match simulation. Message prose that depends on team
// and player names is rendered in a later step; this module stays structural so
// it is deterministic and testable.

export const matchTimelineRoles: Role[] = [
  "top",
  "jungle",
  "mid",
  "bot",
  "support",
];

export type MatchTimelineEventType =
  | "kill"
  | "tower"
  | "inhibitor"
  | "dragon"
  | "soul"
  | "herald"
  | "baron"
  | "elder"
  | "nexus";

export type MatchTimelineKillInfo = {
  assistRoles: Role[];
  isLaningPhase: boolean;
  isSolo: boolean;
  killerRole: Role;
  victimRole: Role;
};

export type MatchTimelineEvent = {
  advantage: LiveMatchEventAdvantage;
  id: string;
  importance: LiveMatchImportance;
  kill?: MatchTimelineKillInfo;
  side: LiveMatchSide;
  timeSec: number;
  type: MatchTimelineEventType;
  visible: boolean;
};

export type GeneratedMatchTimeline = {
  durationSec: number;
  events: MatchTimelineEvent[];
  finalKills: Record<LiveMatchSide, number>;
  winningSide: LiveMatchSide;
};

export type GenerateMatchTimelineInput = {
  // 0 = coin-flip, 1 = total stomp. Drives game length and the winner's lead.
  dominance?: number;
  seed: string;
  winningSide: LiveMatchSide;
};

type DraftEvent = Omit<MatchTimelineEvent, "id">;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

function opposite(side: LiveMatchSide): LiveMatchSide {
  return side === "blue" ? "red" : "blue";
}

function pickRole(random: () => number) {
  return matchTimelineRoles[
    Math.floor(random() * matchTimelineRoles.length)
  ];
}

function sampleRoles(random: () => number, pool: Role[], count: number) {
  const available = [...pool];
  const picked: Role[] = [];

  for (let index = 0; index < count && available.length > 0; index += 1) {
    const choice = Math.floor(random() * available.length);
    picked.push(available.splice(choice, 1)[0]);
  }

  return picked;
}

function createSoloKill(
  random: () => number,
  isLaningPhase: boolean,
): MatchTimelineKillInfo {
  return {
    assistRoles: [],
    isLaningPhase,
    isSolo: true,
    killerRole: pickRole(random),
    victimRole: pickRole(random),
  };
}

function createTeamfightKill(
  random: () => number,
  isLaningPhase: boolean,
): MatchTimelineKillInfo {
  const killerRole = pickRole(random);
  // Teamfight kills carry 2-3 assists so the team assist-to-kill ratio lands in
  // the ~2-3 range the spec asks for; laning solo kills supply the 0-assist case.
  const assistCount = 2 + Math.floor(random() * 2);
  const assistRoles = sampleRoles(
    random,
    matchTimelineRoles.filter((role) => role !== killerRole),
    assistCount,
  );

  return {
    assistRoles,
    isLaningPhase,
    isSolo: false,
    killerRole,
    victimRole: pickRole(random),
  };
}

function toGameDurationMinutes(random: () => number, dominance: number) {
  const roll = random();

  if (dominance >= 0.55) {
    return lerp(24, 29, roll);
  }

  if (dominance >= 0.3) {
    return lerp(30, 36, roll);
  }

  if (dominance >= 0.12) {
    return lerp(37, 44, roll);
  }

  return random() < 0.7 ? lerp(37, 44, roll) : lerp(45, 52, roll);
}

function countKillsBySide(
  events: Array<Pick<MatchTimelineEvent, "side" | "type">>,
): Record<LiveMatchSide, number> {
  const kills: Record<LiveMatchSide, number> = { blue: 0, red: 0 };

  for (const event of events) {
    if (event.type === "kill") {
      kills[event.side] += 1;
    }
  }

  return kills;
}

/**
 * Derive a 0..1 dominance value from a win probability. 0.5 win chance maps to
 * a coin-flip (0); a lopsided probability maps toward a stomp (1).
 */
export function toMatchDominance(winProbability: number) {
  return clamp(Math.abs(winProbability - 0.5) * 2, 0, 1);
}

export function generateMatchTimeline(
  input: GenerateMatchTimelineInput,
): GeneratedMatchTimeline {
  const random = createSeededRandom(input.seed);
  const winningSide = input.winningSide;
  const losingSide = opposite(winningSide);
  const dominance = clamp(input.dominance ?? 0.5, 0, 1);
  const durationMin = toGameDurationMinutes(random, dominance);
  const durationSec = Math.round(durationMin * 60);
  const events: DraftEvent[] = [];

  const winnerWeighted = (lead: number) =>
    random() < clamp(0.5 + dominance * lead, 0.5, 0.85)
      ? winningSide
      : losingSide;

  // 1. Dragons (every ~5 min). First dragon and the soul-granting dragon are
  //    the only ones surfaced in the commentary feed.
  const dragonCount = clamp(Math.floor((durationMin - 6) / 5) + 1, 1, 6);

  for (let index = 0; index < dragonCount; index += 1) {
    const timeSec = clamp(
      Math.round((6 + index * 5 + (random() - 0.5) * 1.5) * 60),
      5 * 60,
      durationSec - 90,
    );
    const side = winnerWeighted(0.18);
    const isSoul = index === 3;

    events.push({
      advantage: side,
      importance: isSoul ? "high" : index === 0 ? "medium" : "low",
      side,
      timeSec,
      type: isSoul ? "soul" : "dragon",
      visible: isSoul || index === 0,
    });
  }

  // 2. Rift Herald (early, usually internal-only).
  if (durationMin >= 9) {
    const side = winnerWeighted(0.1);

    events.push({
      advantage: dominance < 0.2 && random() < 0.5 ? "neutral" : side,
      importance: "low",
      side,
      timeSec: clamp(
        Math.round((9 + random() * 5) * 60),
        8 * 60,
        durationSec - 120,
      ),
      type: "herald",
      visible: false,
    });
  }

  // 3. Baron(s) — strongly winner-weighted, occasionally a steal (critical).
  if (durationMin >= 22) {
    const baronCount = random() < 0.45 ? 2 : 1;

    for (let index = 0; index < baronCount; index += 1) {
      const side = winnerWeighted(0.2);
      const isSteal = random() < 0.12;

      events.push({
        advantage: side,
        importance: isSteal ? "critical" : "high",
        side,
        timeSec: clamp(
          Math.round((22 + index * 7 + random() * 4) * 60),
          20 * 60,
          durationSec - 90,
        ),
        type: "baron",
        visible: true,
      });
    }
  }

  // 4. Elder dragon — only in longer games.
  if (durationMin >= 35 && random() < 0.7) {
    const side = winnerWeighted(0.2);

    events.push({
      advantage: side,
      importance: "critical",
      side,
      timeSec: clamp(
        Math.round((35 + random() * (durationMin - 35)) * 60),
        35 * 60,
        durationSec - 80,
      ),
      type: "elder",
      visible: true,
    });
  }

  // 5. Laning-phase solo kills — rare but always surfaced as key moments.
  const laningKills = Math.floor(random() * 2);

  for (let index = 0; index < laningKills; index += 1) {
    const side = winnerWeighted(0.15);

    events.push({
      advantage: side,
      importance: "high",
      kill: createSoloKill(random, true),
      side,
      timeSec: clamp(Math.round((3 + random() * 10) * 60), 2 * 60, 14 * 60),
      type: "kill",
      visible: true,
    });
  }

  // 6. Mid/late skirmishes and teamfights. Even trades produce neutral-colored
  //    kills for both sides; one-sided fights lean toward the winner.
  const skirmishCount = 4 + Math.floor(random() * (durationMin / 6));

  for (let index = 0; index < skirmishCount; index += 1) {
    const timeSec = clamp(
      Math.round((14 + random() * (durationMin - 16)) * 60),
      12 * 60,
      durationSec - 150,
    );
    const isEvenTrade = random() < 0.22;

    if (isEvenTrade) {
      events.push({
        advantage: "neutral",
        importance: "low",
        kill: createTeamfightKill(random, false),
        side: winningSide,
        timeSec,
        type: "kill",
        visible: false,
      });
      events.push({
        advantage: "neutral",
        importance: "low",
        kill: createTeamfightKill(random, false),
        side: losingSide,
        timeSec: timeSec + 8,
        type: "kill",
        visible: false,
      });
      continue;
    }

    const side = winnerWeighted(0.22);
    const isBigFight = random() < 0.3;

    events.push({
      advantage: side,
      importance: isBigFight ? "high" : "medium",
      kill: createTeamfightKill(random, false),
      side,
      timeSec,
      type: "kill",
      visible: isBigFight,
    });

    if (isBigFight && random() < 0.5) {
      events.push({
        advantage: side,
        importance: "high",
        kill: createTeamfightKill(random, false),
        side,
        timeSec: timeSec + 10,
        type: "kill",
        visible: false,
      });
    }
  }

  // 7. Towers — winner takes the majority, almost all internal-only.
  const winnerTowers = 5 + Math.floor(random() * 5);
  const loserTowers = 1 + Math.floor(random() * 4);

  for (let index = 0; index < winnerTowers; index += 1) {
    events.push({
      advantage: winningSide,
      importance: "low",
      side: winningSide,
      timeSec: clamp(
        Math.round((10 + random() * (durationMin - 10)) * 60),
        9 * 60,
        durationSec - 40,
      ),
      type: "tower",
      visible: false,
    });
  }

  for (let index = 0; index < loserTowers; index += 1) {
    events.push({
      advantage: losingSide,
      importance: "low",
      side: losingSide,
      timeSec: clamp(
        Math.round((12 + random() * (durationMin - 12)) * 60),
        10 * 60,
        durationSec - 90,
      ),
      type: "tower",
      visible: false,
    });
  }

  // 8. Closing sequence in the final 2-3 minutes — always present and visible.
  const closingFightStart =
    durationSec - clamp(Math.round(90 + random() * 60), 90, 170);
  const closingKills = 2 + Math.floor(random() * 3);

  for (let index = 0; index < closingKills; index += 1) {
    events.push({
      advantage: winningSide,
      importance: index === closingKills - 1 ? "critical" : "high",
      kill: createTeamfightKill(random, false),
      side: winningSide,
      timeSec: closingFightStart + index * 12,
      type: "kill",
      visible: true,
    });
  }

  events.push({
    advantage: winningSide,
    importance: "high",
    side: winningSide,
    timeSec: durationSec - 50,
    type: "inhibitor",
    visible: true,
  });
  events.push({
    advantage: winningSide,
    importance: "critical",
    side: winningSide,
    timeSec: durationSec,
    type: "nexus",
    visible: true,
  });

  const ordered = events
    .filter((event) => event.timeSec <= durationSec)
    .sort((left, right) => left.timeSec - right.timeSec)
    .map((event, index) => ({ ...event, id: `evt-${index}` }));

  // Guarantee the winning side finishes ahead on kills. Even-trade kills are
  // left untouched so the trade pairing (and kills = deaths) stays intact.
  let kills = countKillsBySide(ordered);

  for (const event of ordered) {
    if (kills[winningSide] > kills[losingSide]) {
      break;
    }

    if (
      event.type === "kill" &&
      event.side === losingSide &&
      event.advantage !== "neutral"
    ) {
      event.side = winningSide;
      event.advantage = winningSide;
      kills = countKillsBySide(ordered);
    }
  }

  return {
    durationSec,
    events: ordered,
    finalKills: countKillsBySide(ordered),
    winningSide,
  };
}
