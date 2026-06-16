import {
  IconBuildingCastle,
  IconEye,
  IconFlame,
  IconFlameFilled,
  IconShieldBolt,
  IconSwords,
  IconTower,
  IconTrophy,
} from "@tabler/icons-react";

import type { MatchTimelineEventType } from "../../../domain/live-match";

// One icon vocabulary (Tabler outline set) for both the commentary feed and the
// objective bar, replacing the earlier emoji. Icons inherit currentColor, so the
// advantage tone applied by the parent colors them.
const iconByType: Record<MatchTimelineEventType, typeof IconFlame> = {
  baron: IconShieldBolt,
  dragon: IconFlame,
  elder: IconFlameFilled,
  herald: IconEye,
  inhibitor: IconBuildingCastle,
  kill: IconSwords,
  nexus: IconTrophy,
  soul: IconFlameFilled,
  tower: IconTower,
};

type LiveMatchIconProps = {
  size?: number;
  type: MatchTimelineEventType;
};

export function LiveMatchIcon({ size = 18, type }: LiveMatchIconProps) {
  const Icon = iconByType[type];

  return <Icon size={size} stroke={1.8} aria-hidden />;
}
