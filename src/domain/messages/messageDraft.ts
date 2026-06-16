import type { CareerMessage } from "../../types/game";

export type MessageDraft = Omit<CareerMessage, "id" | "read"> & {
  id?: string;
  read?: boolean;
};
