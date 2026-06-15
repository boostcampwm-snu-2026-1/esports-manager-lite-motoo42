import type { Player, Role } from "../../types/game";

// Player detail attributes (#72). This is a presentation/derivation layer over the
// existing Player fields — it does NOT change the data model or the match-result
// calculation. 11 of the 16 attributes map straight onto existing fields (several
// of which were previously hidden inside `mindset` / `adaptability`); five are
// derived deterministically per player — `positioning`, `lateGame`, `aggression`
// from related stats, and `ego` / `leadership` as wide-spread, skill-independent
// traits. None of the derived five (nor the temperament group) feed the position
// overall. `potential` stays off the panel, shown only as 잠재 next to the overall.

export type PlayerAttributeKey =
  | "laning"
  | "mechanics"
  | "positioning"
  | "championPool"
  | "teamfight"
  | "macro"
  | "prediction"
  | "shotcalling"
  | "focus"
  | "mentalStrength"
  | "clutch"
  | "composure"
  | "lateGame"
  | "aggression"
  | "ego"
  | "leadership";

export const playerAttributeLabels: Record<PlayerAttributeKey, string> = {
  laning: "라인전",
  mechanics: "메카닉",
  positioning: "포지셔닝",
  championPool: "챔피언 폭",
  teamfight: "교전",
  macro: "운영",
  prediction: "예측력",
  shotcalling: "오더",
  focus: "집중력",
  mentalStrength: "정신력",
  clutch: "클러치",
  composure: "침착함",
  lateGame: "후반 캐리",
  aggression: "공격성",
  ego: "에고",
  leadership: "리더십",
};

// One-sentence, present-tense descriptions of what each attribute represents —
// shown as a hover tooltip on the attribute name. Kept short so the tooltip box
// stays small.
export const playerAttributeDescriptions: Record<PlayerAttributeKey, string> = {
  laning: "라인 단계에서 주도권을 잡고 초반 킬 압박에 영향을 줍니다.",
  mechanics: "스킬 사용과 교전 컨트롤의 정밀함을 좌우합니다.",
  positioning: "한타에서 안전한 위치 선정과 생존력에 영향을 줍니다.",
  championPool: "다룰 수 있는 챔피언의 폭과 밴픽 유연성을 결정합니다.",
  teamfight: "한타와 소규모 교전에서의 기여도를 좌우합니다.",
  macro: "맵 장악과 오브젝트 판단 등 거시 운영에 영향을 줍니다.",
  prediction: "적의 움직임과 다음 수를 미리 읽는 감각에 영향을 줍니다.",
  shotcalling: "팀의 콜과 교전 시점 결정에 영향을 줍니다.",
  focus: "경기 내내 일관된 수행력을 유지하는 데 영향을 줍니다.",
  mentalStrength: "압박 상황에서 흔들리지 않는 정신적 강함을 나타냅니다.",
  clutch: "박빙의 결정적 순간에 발휘하는 수행력을 좌우합니다.",
  composure: "위기와 손해 상황에서 평정을 유지하는 능력을 나타냅니다.",
  lateGame: "후반 한타에서 경기를 캐리하는 능력을 좌우합니다.",
  aggression: "공격적인 플레이와 적극적인 교전 성향에 영향을 줍니다.",
  ego: "자신의 판단과 플레이 방향을 강하게 밀고 나가려는 성향을 나타냅니다.",
  leadership: "팀을 이끌고 팀 내 영향력을 발휘하는 능력을 나타냅니다.",
};

export type PlayerAttributeGroup = {
  key: "technical" | "tactical" | "mental" | "temperament";
  attributes: PlayerAttributeKey[];
};

// Four FM-style clusters, separated by a divider in the panel (no visible label,
// matching the reference).
export const playerAttributeGroups: PlayerAttributeGroup[] = [
  { key: "technical", attributes: ["laning", "mechanics", "positioning", "championPool"] },
  { key: "tactical", attributes: ["teamfight", "macro", "prediction", "shotcalling"] },
  { key: "mental", attributes: ["focus", "mentalStrength", "clutch", "composure"] },
  { key: "temperament", attributes: ["lateGame", "aggression", "ego", "leadership"] },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

// Deterministic per-player offset in [-spread, +spread]. Lets a seeded attribute
// diverge from its parent stat without RNG, so the same player always reads the
// same value (and saves never need migrating).
function seededVariation(id: string, salt: string, spread: number) {
  const source = `${id}:${salt}`;
  let hash = 0;

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) | 0;
  }

  const unit = ((hash >>> 0) % 1000) / 1000;

  return (unit * 2 - 1) * spread;
}

// A deterministic, widely-spread rating for "soft" personality traits that do not
// track skill (ego, leadership). Summing two independent seeds gives a roughly
// triangular spread centered mid-range: most players land in the middle, but the
// gray (<50) and gold (90+) tails are reachable — including for top players.
function seededWideRating(id: string, salt: string) {
  return (
    66 + seededVariation(id, `${salt}-a`, 18) + seededVariation(id, `${salt}-b`, 16)
  );
}

export function getPlayerAttributes(
  player: Player,
): Record<PlayerAttributeKey, number> {
  const score = (value: number) => clamp(Math.round(value), 1, 99);

  return {
    laning: score(player.laning),
    mechanics: score(player.mechanics),
    positioning: score(
      player.teamfight * 0.55 +
        player.mechanics * 0.25 +
        player.mindset.consistency * 0.2 +
        seededVariation(player.id, "positioning", 6),
    ),
    championPool: score(player.championPool),
    teamfight: score(player.teamfight),
    macro: score(player.macro),
    prediction: score(player.adaptability.metaAdaptability),
    shotcalling: score(player.mindset.communication),
    focus: score(player.mindset.consistency),
    mentalStrength: score(player.mental),
    clutch: score(player.mindset.clutch),
    composure: score(player.mindset.tiltControl),
    lateGame: score(
      player.teamfight * 0.45 +
        player.mechanics * 0.3 +
        player.mindset.clutch * 0.25 +
        seededVariation(player.id, "lateGame", 7),
    ),
    aggression: score(
      player.mechanics * 0.4 +
        player.teamfight * 0.35 +
        (100 - player.mindset.tiltControl) * 0.25 +
        seededVariation(player.id, "aggression", 10),
    ),
    ego: score(seededWideRating(player.id, "ego")),
    leadership: score(seededWideRating(player.id, "leadership")),
  };
}

type OverallWeightKey = Extract<
  PlayerAttributeKey,
  | "laning"
  | "teamfight"
  | "macro"
  | "championPool"
  | "focus"
  | "clutch"
  | "mentalStrength"
>;

// Position-weighted overall (#72). Each role values the core attributes
// differently; weights sum to 1 so the result stays on the 0-100 scale. Growth /
// temperament are intentionally excluded — current ability only. This is a pure
// helper offered to UI and (later) the match engine; it does not feed the live
// match-result calculation yet.
const roleOverallWeights: Record<Role, Record<OverallWeightKey, number>> = {
  top: { laning: 0.24, teamfight: 0.2, macro: 0.16, championPool: 0.08, focus: 0.18, clutch: 0.06, mentalStrength: 0.08 },
  jungle: { laning: 0.1, teamfight: 0.22, macro: 0.3, championPool: 0.1, focus: 0.12, clutch: 0.08, mentalStrength: 0.08 },
  mid: { laning: 0.24, teamfight: 0.22, macro: 0.12, championPool: 0.16, focus: 0.06, clutch: 0.12, mentalStrength: 0.08 },
  bot: { laning: 0.2, teamfight: 0.26, macro: 0.08, championPool: 0.1, focus: 0.18, clutch: 0.1, mentalStrength: 0.08 },
  support: { laning: 0.12, teamfight: 0.22, macro: 0.28, championPool: 0.08, focus: 0.16, clutch: 0.06, mentalStrength: 0.08 },
};

export function computeRoleOverall(
  player: Player,
  role: Role = player.role,
): number {
  const attributes = getPlayerAttributes(player);
  const weights = roleOverallWeights[role];

  const total = (Object.keys(weights) as OverallWeightKey[]).reduce(
    (sum, key) => sum + attributes[key] * weights[key],
    0,
  );

  return clamp(Math.round(total), 1, 99);
}

export type PlayerAttributeTier =
  | "worldclass"
  | "elite"
  | "high"
  | "mid"
  | "low"
  | "weak";

// Six grade bands calibrated to where pro / semi-pro ratings actually sit (most
// values cluster in 50-95), so the dense range gets real color separation rather
// than collapsing into two tiers. Bands follow the #72 grade scale: 90+ 월드클래스,
// 80s 리그 상위권, 70s 좋은 선수, 60s 리그 평균권, 50s 보통 이하, <50 약점.
export function getAttributeTier(value: number): PlayerAttributeTier {
  if (value >= 90) {
    return "worldclass";
  }

  if (value >= 80) {
    return "elite";
  }

  if (value >= 70) {
    return "high";
  }

  if (value >= 60) {
    return "mid";
  }

  if (value >= 50) {
    return "low";
  }

  return "weak";
}
