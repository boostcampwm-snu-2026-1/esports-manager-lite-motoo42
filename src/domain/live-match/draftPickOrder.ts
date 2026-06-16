import { createSeededRandom } from "../rng/createSeededRandom";

// A set's pick order. For each side, roleByOrdinal[ordinal] = role index (0..4 into
// the canonical [top, jungle, mid, bot, support] order) — a seeded permutation, so
// which role a side takes at its 1st, 2nd, ... pick varies per set.
//
// This is the single source of truth for the pick order: the SAME object drives both
// the staggered banpick reveal and the second-phase ban targeting (which of the
// opponent's not-yet-picked roles to deny), so the two never disagree.
export type DraftPickOrder = {
  blue: number[];
  red: number[];
};

// Seeded Fisher–Yates permutation of the five role indices.
function seededRoleOrder(seed: string): number[] {
  const random = createSeededRandom(seed);
  const roles = [0, 1, 2, 3, 4];

  for (let index = roles.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [roles[index], roles[swap]] = [roles[swap], roles[index]];
  }

  return roles;
}

// One stable pick order per set. Seeded off the set's outcome seed so it is fixed for
// the set and INDEPENDENT of the bans — the second-phase bans are derived from this
// order, so seeding the order off the bans would be circular.
export function createDraftPickOrder(seed: string): DraftPickOrder {
  return {
    blue: seededRoleOrder(`${seed}:blue`),
    red: seededRoleOrder(`${seed}:red`),
  };
}

// Invert roleByOrdinal → ordinalByRole[roleIndex] = ordinal, for the reveal lookups.
export function ordinalByRoleFromPickOrder(roleByOrdinal: number[]): number[] {
  const ordinalByRole: number[] = [];

  roleByOrdinal.forEach((roleIndex, ordinal) => {
    ordinalByRole[roleIndex] = ordinal;
  });

  return ordinalByRole;
}

// The role indices a side picks during the SECOND pick phase (ordinals 3 and 4) — i.e.
// the two roles still hidden when the second ban phase happens. These are what the
// opponent aims their second-phase bans at.
export function secondPhasePickRoleIndices(roleByOrdinal: number[]): number[] {
  return [roleByOrdinal[3], roleByOrdinal[4]];
}
