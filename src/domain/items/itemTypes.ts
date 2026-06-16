export type MatchItemTag =
  | "boots"
  | "fighter"
  | "mage"
  | "marksman"
  | "support"
  | "tank"
  | "utility";

export type MatchItem = {
  iconUrl: string;
  id: string;
  name: string;
  tags: MatchItemTag[];
};
