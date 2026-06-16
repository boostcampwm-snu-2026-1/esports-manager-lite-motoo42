import {
  IconBiohazard,
  IconBolt,
  IconDroplet,
  IconFlame,
  IconMountain,
  IconWind,
} from "@tabler/icons-react";

import type { DragonType } from "../../../domain/live-match";

// Each elemental dragon gets its own Tabler icon + color so the objective bar
// and commentary show which dragon was taken, not just a count.
const dragonIcon: Record<
  DragonType,
  { Icon: typeof IconFlame; color: string }
> = {
  infernal: { Icon: IconFlame, color: "#ff6b4a" },
  mountain: { Icon: IconMountain, color: "#d2a35a" },
  ocean: { Icon: IconDroplet, color: "#4ea2ff" },
  cloud: { Icon: IconWind, color: "#7fe3d0" },
  hextech: { Icon: IconBolt, color: "#f8c15c" },
  chemtech: { Icon: IconBiohazard, color: "#7bd154" },
};

type LiveDragonIconProps = {
  size?: number;
  type: DragonType;
};

export function LiveDragonIcon({ size = 14, type }: LiveDragonIconProps) {
  const { Icon, color } = dragonIcon[type];

  return <Icon size={size} stroke={2} color={color} aria-hidden />;
}
