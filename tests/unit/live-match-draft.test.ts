import { describe, expect, it } from "vitest";
import { championPool } from "../../src/domain/champions";
import {
  applyDraftToLiveMatchTeams,
  createLiveMatchDraftFromSummary,
} from "../../src/domain/live-match/draftAdapter";
import type { DraftPickOrder } from "../../src/domain/live-match/draftPickOrder";
import {
  getLiveMatchChampionSummary,
  liveMatchRoles,
} from "../../src/domain/live-match/mockDraft";
import type {
  LiveMatchTeamPresentation,
} from "../../src/domain/live-match/types";
import type { MatchDraftSummary, Role } from "../../src/types/game";

const roles: Role[] = ["top", "jungle", "mid", "bot", "support"];

// ordinal -> roleIndex. Ordinals 3 and 4 are the second-phase picks — the two roles
// still hidden at the second ban phase, which decide what the opponent bans against.
// blue's open roles = support(4), top(0); red's open roles = jungle(1), mid(2).
const pickOrder: DraftPickOrder = {
  blue: [1, 2, 3, 4, 0],
  red: [3, 4, 0, 1, 2],
};

function createTeam(name: string): LiveMatchTeamPresentation {
  return {
    gold: "0",
    id: name.toLowerCase(),
    kills: 0,
    name,
    objectives: {
      barons: 0,
      dragons: 0,
      dragonTypes: [],
      heralds: 0,
      towers: 0,
    },
    players: roles.map((role) => ({
      champion: getLiveMatchChampionSummary("aatrox"),
      name: `${name} ${role}`,
      role,
      stats: {
        assists: 0,
        deaths: 0,
        gold: "0",
        itemSlots: [],
        kills: 0,
        level: 1,
      },
    })),
    shortName: name.slice(0, 3).toUpperCase(),
  };
}

const draft: MatchDraftSummary = {
  blueBanIds: ["ksante", "varus", "xayah", "rakan", "nidalee"],
  blueBans: ["K'Sante", "Varus", "Xayah", "Rakan", "Nidalee"],
  blueDraftPower: 80,
  bluePicks: {
    bot: { championId: "ashe", championName: "Ashe", fitScore: 90, reasons: [] },
    jungle: { championId: "vi", championName: "Vi", fitScore: 90, reasons: [] },
    mid: { championId: "ahri", championName: "Ahri", fitScore: 90, reasons: [] },
    support: { championId: "rell", championName: "Rell", fitScore: 90, reasons: [] },
    top: { championId: "aatrox", championName: "Aatrox", fitScore: 90, reasons: [] },
  },
  netDraftPower: 1,
  notes: [],
  redBanIds: ["orianna", "azir", "jinx", "gnar", "zeri"],
  redBans: ["Orianna", "Azir", "Jinx", "Gnar", "Zeri"],
  redDraftPower: 76,
  redPicks: {
    bot: { championId: "senna", championName: "Senna", fitScore: 90, reasons: [] },
    jungle: { championId: "lee-sin", championName: "Lee Sin", fitScore: 90, reasons: [] },
    mid: { championId: "corki", championName: "Corki", fitScore: 90, reasons: [] },
    support: { championId: "lulu", championName: "Lulu", fitScore: 90, reasons: [] },
    top: { championId: "rumble", championName: "Rumble", fitScore: 90, reasons: [] },
  },
  usedChampionIds: [],
};

describe("live match draft adapter", () => {
  it("maps draft bans, fearless rows, and team picks to live presentation data", () => {
    const liveDraft = createLiveMatchDraftFromSummary({
      draft,
      format: "bo3",
      pickOrder,
      usedChampionIdsByGame: [
        ["aatrox", "rumble", "vi", "lee-sin", "ahri", "corki", "ashe", "senna", "rell", "lulu"],
      ],
    });

    const teams = applyDraftToLiveMatchTeams({
      blueTeam: createTeam("T1"),
      draft,
      redTeam: createTeam("GEN"),
    });

    expect(liveDraft.blueBans).toHaveLength(5);
    expect(liveDraft.redBans).toHaveLength(5);
    expect(liveDraft.fearlessRows).toHaveLength(3);
    expect(liveDraft.fearlessRows[0].champions).toHaveLength(10);
    expect(teams.blueTeam.players.map((player) => player.champion.id)).toEqual([
      "aatrox",
      "vi",
      "ahri",
      "ashe",
      "rell",
    ]);
    expect(teams.redTeam.players.map((player) => player.champion.id)).toEqual([
      "rumble",
      "lee-sin",
      "corki",
      "senna",
      "lulu",
    ]);
  });

  it("aims second-phase bans at the opponent's two still-hidden roles", () => {
    const liveDraft = createLiveMatchDraftFromSummary({
      draft,
      format: "bo3",
      pickOrder,
      usedChampionIdsByGame: [],
    });

    const championById = new Map(
      championPool.map((champion) => [champion.id, champion]),
    );
    const redOpenRoles = [
      liveMatchRoles[pickOrder.red[3]],
      liveMatchRoles[pickOrder.red[4]],
    ]; // jungle, mid
    const blueOpenRoles = [
      liveMatchRoles[pickOrder.blue[3]],
      liveMatchRoles[pickOrder.blue[4]],
    ]; // support, top

    // First-phase bans (slots 0-2) stay exactly as the draft decided them.
    expect(liveDraft.blueBans.slice(0, 3).map((ban) => ban.id)).toEqual([
      "ksante",
      "varus",
      "xayah",
    ]);
    expect(liveDraft.redBans.slice(0, 3).map((ban) => ban.id)).toEqual([
      "orianna",
      "azir",
      "jinx",
    ]);

    const bluePhase2 = liveDraft.blueBans.slice(3);
    const redPhase2 = liveDraft.redBans.slice(3);

    expect(bluePhase2).toHaveLength(2);
    expect(redPhase2).toHaveLength(2);

    // Blue's second-phase bans come from red's open-role pool; red's from blue's.
    for (const ban of bluePhase2) {
      const champion = championById.get(ban.id);
      expect(champion?.roles.some((role) => redOpenRoles.includes(role))).toBe(
        true,
      );
    }
    for (const ban of redPhase2) {
      const champion = championById.get(ban.id);
      expect(champion?.roles.some((role) => blueOpenRoles.includes(role))).toBe(
        true,
      );
    }

    // Never ban a picked champion, and never the same champion twice.
    const pickIds = [
      ...Object.values(draft.bluePicks),
      ...Object.values(draft.redPicks),
    ].map((pick) => pick.championId);
    const phase2Ids = [...bluePhase2, ...redPhase2].map((ban) => ban.id);

    for (const id of phase2Ids) {
      expect(pickIds).not.toContain(id);
    }
    expect(new Set(phase2Ids).size).toBe(phase2Ids.length);
  });
});
