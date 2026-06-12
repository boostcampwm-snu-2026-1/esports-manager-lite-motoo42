import type { CareerProgressResult } from "../../domain/game-progress/progressCareer";
import {
  loadAppSettings,
  type AppSettings,
} from "../../domain/settings/appSettings";
import type { CareerSave, CompetitionId } from "../../types/game";
import type { AppRoute } from "../routes";

export type GameState = {
  route: AppRoute;
  career: CareerSave | null;
  lastMatch: CareerProgressResult["lastMatch"];
  selectedCompetitionId: CompetitionId | null;
  appSettings: AppSettings;
};

export function createInitialGameState(): GameState {
  return {
    route: "career-setup",
    career: null,
    lastMatch: null,
    selectedCompetitionId: null,
    appSettings: loadAppSettings(),
  };
}

export const initialGameState: GameState = createInitialGameState();
