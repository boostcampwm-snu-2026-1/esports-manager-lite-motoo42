import { getItemIconUrl } from "../riot-data-dragon";
import type { MatchItem, MatchItemTag } from "./itemTypes";

type MatchItemSeed = {
  id: string;
  name: string;
  tags: MatchItemTag[];
};

function createMatchItem(seed: MatchItemSeed): MatchItem {
  return {
    ...seed,
    iconUrl: getItemIconUrl(seed.id),
  };
}

export const matchItemPool: MatchItem[] = [
  createMatchItem({ id: "3006", name: "Berserker's Greaves", tags: ["boots", "marksman"] }),
  createMatchItem({ id: "3047", name: "Plated Steelcaps", tags: ["boots", "tank", "fighter"] }),
  createMatchItem({ id: "3111", name: "Mercury's Treads", tags: ["boots", "tank", "fighter"] }),
  createMatchItem({ id: "3158", name: "Ionian Boots of Lucidity", tags: ["boots", "utility"] }),
  createMatchItem({ id: "3020", name: "Sorcerer's Shoes", tags: ["boots", "mage"] }),

  createMatchItem({ id: "3078", name: "Trinity Force", tags: ["fighter"] }),
  createMatchItem({ id: "6631", name: "Stridebreaker", tags: ["fighter"] }),
  createMatchItem({ id: "6333", name: "Death's Dance", tags: ["fighter"] }),
  createMatchItem({ id: "3053", name: "Sterak's Gage", tags: ["fighter", "tank"] }),
  createMatchItem({ id: "3071", name: "Black Cleaver", tags: ["fighter"] }),
  createMatchItem({ id: "3161", name: "Spear of Shojin", tags: ["fighter"] }),
  createMatchItem({ id: "6662", name: "Iceborn Gauntlet", tags: ["fighter", "tank"] }),
  createMatchItem({ id: "6692", name: "Eclipse", tags: ["fighter"] }),
  createMatchItem({ id: "6699", name: "Voltaic Cyclosword", tags: ["fighter"] }),

  createMatchItem({ id: "3031", name: "Infinity Edge", tags: ["marksman"] }),
  createMatchItem({ id: "3085", name: "Runaan's Hurricane", tags: ["marksman"] }),
  createMatchItem({ id: "3094", name: "Rapid Firecannon", tags: ["marksman"] }),
  createMatchItem({ id: "3036", name: "Lord Dominik's Regards", tags: ["marksman"] }),
  createMatchItem({ id: "6672", name: "Kraken Slayer", tags: ["marksman"] }),
  createMatchItem({ id: "6676", name: "The Collector", tags: ["marksman"] }),
  createMatchItem({ id: "6673", name: "Immortal Shieldbow", tags: ["marksman"] }),
  createMatchItem({ id: "3508", name: "Essence Reaver", tags: ["marksman"] }),

  createMatchItem({ id: "3089", name: "Rabadon's Deathcap", tags: ["mage"] }),
  createMatchItem({ id: "3157", name: "Zhonya's Hourglass", tags: ["mage", "utility"] }),
  createMatchItem({ id: "6655", name: "Luden's Companion", tags: ["mage"] }),
  createMatchItem({ id: "4645", name: "Shadowflame", tags: ["mage"] }),
  createMatchItem({ id: "3135", name: "Void Staff", tags: ["mage"] }),
  createMatchItem({ id: "3116", name: "Rylai's Crystal Scepter", tags: ["mage", "utility"] }),
  createMatchItem({ id: "3003", name: "Archangel's Staff", tags: ["mage"] }),
  createMatchItem({ id: "4628", name: "Horizon Focus", tags: ["mage"] }),

  createMatchItem({ id: "3068", name: "Sunfire Aegis", tags: ["tank"] }),
  createMatchItem({ id: "3084", name: "Heartsteel", tags: ["tank"] }),
  createMatchItem({ id: "3143", name: "Randuin's Omen", tags: ["tank"] }),
  createMatchItem({ id: "6665", name: "Jak'Sho, The Protean", tags: ["tank"] }),
  createMatchItem({ id: "3065", name: "Spirit Visage", tags: ["tank"] }),
  createMatchItem({ id: "3075", name: "Thornmail", tags: ["tank"] }),
  createMatchItem({ id: "2502", name: "Unending Despair", tags: ["tank"] }),
  createMatchItem({ id: "6664", name: "Hollow Radiance", tags: ["tank"] }),

  createMatchItem({ id: "3869", name: "Celestial Opposition", tags: ["support", "tank"] }),
  createMatchItem({ id: "3870", name: "Dream Maker", tags: ["support", "utility"] }),
  createMatchItem({ id: "3871", name: "Zaz'Zak's Realmspike", tags: ["support", "mage"] }),
  createMatchItem({ id: "3876", name: "Solstice Sleigh", tags: ["support", "tank"] }),
  createMatchItem({ id: "3109", name: "Knight's Vow", tags: ["support", "tank"] }),
  createMatchItem({ id: "3222", name: "Mikael's Blessing", tags: ["support", "utility"] }),
  createMatchItem({ id: "3504", name: "Ardent Censer", tags: ["support", "utility"] }),
  createMatchItem({ id: "3107", name: "Redemption", tags: ["support", "utility"] }),
  createMatchItem({ id: "6617", name: "Moonstone Renewer", tags: ["support", "utility"] }),
  createMatchItem({ id: "2065", name: "Shurelya's Battlesong", tags: ["support", "utility"] }),
  createMatchItem({ id: "3190", name: "Locket of the Iron Solari", tags: ["support", "tank"] }),
];

export function getMatchItem(itemId: string) {
  return matchItemPool.find((item) => item.id === itemId);
}

export function getMatchItems(itemIds: Array<string | null>) {
  return itemIds.map((itemId) => (itemId ? getMatchItem(itemId) ?? null : null));
}
