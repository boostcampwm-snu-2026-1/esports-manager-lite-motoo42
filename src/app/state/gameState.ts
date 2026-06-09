import type { CareerProgressResult } from "../../domain/game-progress/progressCareer";
import type { CareerSave, CompetitionId } from "../../types/game";
import type { AppRoute } from "../routes";

export type GameState = {
  route: AppRoute;
  career: CareerSave | null;
  lastMatch: CareerProgressResult["lastMatch"];
  selectedCompetitionId: CompetitionId | null;
};

export const initialGameState: GameState = {
  route: "career-setup",
  career: null,
  lastMatch: null,
  selectedCompetitionId: null,
};
