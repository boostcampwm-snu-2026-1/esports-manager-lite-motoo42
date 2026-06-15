import { describe, expect, it } from "vitest";
import { lck2026Players } from "../../src/data/lck2026Players";
import {
  computeRoleOverall,
  getAttributeTier,
  getPlayerAttributes,
  playerAttributeDescriptions,
  playerAttributeGroups,
} from "../../src/domain/player-attributes";
import type { Player } from "../../src/types/game";

const base = lck2026Players[0];

type PlayerOverrides = Partial<Omit<Player, "mindset">> & {
  mindset?: Partial<Player["mindset"]>;
};

function makePlayer(overrides: PlayerOverrides = {}): Player {
  const { mindset, ...rest } = overrides;

  return {
    ...base,
    ...rest,
    mindset: { ...base.mindset, ...(mindset ?? {}) },
  };
}

const allKeys = playerAttributeGroups.flatMap((group) => group.attributes);

describe("player attributes", () => {
  it("derives all 16 attributes within 1..99", () => {
    for (const player of lck2026Players.slice(0, 12)) {
      const attributes = getPlayerAttributes(player);

      expect([...Object.keys(attributes)].sort()).toEqual([...allKeys].sort());

      for (const key of allKeys) {
        expect(attributes[key]).toBeGreaterThanOrEqual(1);
        expect(attributes[key]).toBeLessThanOrEqual(99);
      }
    }
  });

  it("is deterministic for the same player", () => {
    const player = lck2026Players[3];

    expect(getPlayerAttributes(player)).toEqual(getPlayerAttributes(player));
  });

  it("maps existing fields straight through to their attributes", () => {
    const player = makePlayer({
      laning: 77,
      teamfight: 81,
      macro: 64,
      championPool: 88,
      mental: 59,
    });
    const attributes = getPlayerAttributes(player);

    expect(attributes.laning).toBe(77);
    expect(attributes.teamfight).toBe(81);
    expect(attributes.macro).toBe(64);
    expect(attributes.championPool).toBe(88);
    expect(attributes.mentalStrength).toBe(59);
  });

  it("returns a flat overall when every weighted core stat is equal", () => {
    const player = makePlayer({
      role: "mid",
      laning: 70,
      teamfight: 70,
      macro: 70,
      championPool: 70,
      mental: 70,
      mindset: { consistency: 70, clutch: 70 },
    });

    expect(computeRoleOverall(player)).toBe(70);
  });

  it("weights positions differently — jungle values macro over laning", () => {
    const player = makePlayer({
      laning: 40,
      macro: 90,
      teamfight: 60,
      championPool: 60,
      mental: 60,
      mindset: { consistency: 60, clutch: 60 },
    });

    expect(computeRoleOverall(player, "jungle")).toBeGreaterThan(
      computeRoleOverall(player, "mid"),
    );
  });

  it("excludes the soft traits (ego/leadership) from the position overall", () => {
    const core: PlayerOverrides = {
      laning: 75,
      teamfight: 75,
      macro: 75,
      championPool: 75,
      mental: 75,
      mindset: { consistency: 75, clutch: 75 },
    };
    const a = makePlayer({ ...core, id: "trait-seed-alpha" });
    const b = makePlayer({ ...core, id: "trait-seed-omega" });
    const attributesA = getPlayerAttributes(a);
    const attributesB = getPlayerAttributes(b);

    // The wide-spread soft traits really do differ between the two ids...
    expect(
      attributesA.ego !== attributesB.ego ||
        attributesA.leadership !== attributesB.leadership,
    ).toBe(true);
    // ...yet the position overall is identical, proving they are excluded from it.
    expect(computeRoleOverall(a)).toBe(computeRoleOverall(b));
  });

  it("provides a short one-line description for every attribute", () => {
    for (const key of allKeys) {
      const description = playerAttributeDescriptions[key];

      expect(description).toBeTruthy();
      expect(description.length).toBeLessThan(40);
      expect(description.endsWith(".")).toBe(true);
    }
  });

  it("buckets values into six grade bands (90/80/70/60/50)", () => {
    expect(getAttributeTier(90)).toBe("worldclass");
    expect(getAttributeTier(89)).toBe("elite");
    expect(getAttributeTier(80)).toBe("elite");
    expect(getAttributeTier(79)).toBe("high");
    expect(getAttributeTier(70)).toBe("high");
    expect(getAttributeTier(69)).toBe("mid");
    expect(getAttributeTier(60)).toBe("mid");
    expect(getAttributeTier(59)).toBe("low");
    expect(getAttributeTier(50)).toBe("low");
    expect(getAttributeTier(49)).toBe("weak");
    expect(getAttributeTier(1)).toBe("weak");
  });
});
