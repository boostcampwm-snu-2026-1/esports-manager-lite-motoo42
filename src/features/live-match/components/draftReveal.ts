import { useEffect, useMemo, useState } from "react";

import {
  createDraftPickOrder,
  ordinalByRoleFromPickOrder,
} from "../../../domain/live-match";
import type { DraftPickOrder, LiveMatchSide } from "../../../domain/live-match";

// Shared staggered-reveal logic for the draft screens (classic + broadcast).
//
// The draft TIMING is fixed — ban indices and each side's pick ORDINAL (0 = that
// side's first pick), phase 1 = three picks per side, phase 2 = two. Which ROLE a
// side picks at each ordinal is seeded per draft, so the pick order varies and a
// bot/support can be taken early instead of always last.

export type DraftActionKind = "ban" | "pick";

type DraftStep =
  | { index: number; kind: "ban"; side: LiveMatchSide }
  | { kind: "pick"; ordinal: number; side: LiveMatchSide };

const draftStepSequence: DraftStep[] = [
  { kind: "ban", side: "blue", index: 0 },
  { kind: "ban", side: "red", index: 0 },
  { kind: "ban", side: "blue", index: 1 },
  { kind: "ban", side: "red", index: 1 },
  { kind: "ban", side: "blue", index: 2 },
  { kind: "ban", side: "red", index: 2 },
  { kind: "pick", side: "blue", ordinal: 0 },
  { kind: "pick", side: "red", ordinal: 0 },
  { kind: "pick", side: "red", ordinal: 1 },
  { kind: "pick", side: "blue", ordinal: 1 },
  { kind: "pick", side: "blue", ordinal: 2 },
  { kind: "pick", side: "red", ordinal: 2 },
  { kind: "ban", side: "red", index: 3 },
  { kind: "ban", side: "blue", index: 3 },
  { kind: "ban", side: "red", index: 4 },
  { kind: "ban", side: "blue", index: 4 },
  { kind: "pick", side: "red", ordinal: 3 },
  { kind: "pick", side: "blue", ordinal: 3 },
  { kind: "pick", side: "blue", ordinal: 4 },
  { kind: "pick", side: "red", ordinal: 4 },
];

export const draftRevealTotal = draftStepSequence.length;
export const draftRevealStepMs = 600; // ~12s across the 20 actions

const banStepIndex = new Map<string, number>();
const pickStepIndex = new Map<string, number>();
draftStepSequence.forEach((step, index) => {
  if (step.kind === "ban") {
    banStepIndex.set(`${step.side}-${step.index}`, index);
  } else {
    pickStepIndex.set(`${step.side}-${step.ordinal}`, index);
  }
});

export type DraftRevealState = {
  isRevealed: (
    kind: DraftActionKind,
    side: LiveMatchSide,
    index: number,
  ) => boolean;
  // The (seeded) pick ordinal for a role — 0 = that side's first pick. Drives both
  // when a champion appears and which fixed deal slot it lands in before the swap.
  pickOrdinal: (side: LiveMatchSide, roleIndex: number) => number;
  revealAll: () => void;
  revealed: number;
};

// Stagger the already-decided draft in, restarting whenever the set's draft changes.
// `instant` shows it fully revealed with no animation — used when returning to a
// banpick that was already watched, so it doesn't re-shuffle on re-entry.
export function useDraftReveal(
  resetKey: string,
  instant = false,
  pickOrder?: DraftPickOrder,
): DraftRevealState {
  const [revealed, setRevealed] = useState(instant ? draftRevealTotal : 0);

  useEffect(() => {
    if (instant) {
      setRevealed(draftRevealTotal);

      return;
    }

    setRevealed(0);
    const timer = window.setInterval(() => {
      setRevealed((current) => {
        if (current >= draftRevealTotal) {
          window.clearInterval(timer);

          return current;
        }

        return current + 1;
      });
    }, draftRevealStepMs);

    return () => window.clearInterval(timer);
  }, [resetKey, instant]);

  // Per-side role → pick ordinal. Uses the set's shared pick order when provided, so
  // the reveal lines up with the second-phase ban targeting; otherwise falls back to a
  // pick order seeded off the reset key (legacy classic draft screen).
  const ordinalByRole = useMemo(() => {
    const order = pickOrder ?? createDraftPickOrder(resetKey);

    return {
      blue: ordinalByRoleFromPickOrder(order.blue),
      red: ordinalByRoleFromPickOrder(order.red),
    };
  }, [pickOrder, resetKey]);

  return {
    revealAll: () => setRevealed(draftRevealTotal),
    revealed,
    pickOrdinal: (side, roleIndex) => ordinalByRole[side][roleIndex],
    isRevealed: (kind, side, index) => {
      const step =
        kind === "ban"
          ? banStepIndex.get(`${side}-${index}`)
          : pickStepIndex.get(`${side}-${ordinalByRole[side][index]}`);

      return step !== undefined && step < revealed;
    },
  };
}
