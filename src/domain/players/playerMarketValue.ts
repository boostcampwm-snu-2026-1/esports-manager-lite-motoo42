import type { Player } from "../../types/game";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export function calculatePlayerMarketValue(player: Player) {
  const abilityValue = Math.max(0, player.overall - 50) * 3.8;
  const potentialValue = Math.max(0, player.potential - player.overall) * 2.2;
  const brandValue =
    player.marketProfile.marketability * 0.28 +
    player.marketProfile.fanbase * 0.18 -
    player.marketProfile.brandRisk * 0.16;
  const tierMultiplier = player.rosterTier === "academy" ? 0.82 : 1;

  return clamp(
    (abilityValue + potentialValue + brandValue + 18) * tierMultiplier,
    20,
    180,
  );
}

export function blendPlayerSalaryExpectation(
  currentSalary: number,
  marketValue: number,
) {
  return clamp(currentSalary * 0.7 + marketValue * 0.3, 20, 180);
}
