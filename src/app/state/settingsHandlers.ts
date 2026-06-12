import { markCareerGuideSeen } from "../../domain/career/careerGuides";
import {
  saveAppSettings,
  setFirstEntryGuidesEnabled,
} from "../../domain/settings/appSettings";
import type { GameAction } from "./gameActions";
import type { GameState } from "./gameState";

type SettingsAction = Extract<
  GameAction,
  {
    type: "set-first-entry-guides-enabled" | "mark-career-guide-seen";
  }
>;

export function handleSettingsAction(
  state: GameState,
  action: SettingsAction,
): GameState {
  if (action.type === "set-first-entry-guides-enabled") {
    const appSettings = setFirstEntryGuidesEnabled(
      state.appSettings,
      action.enabled,
    );

    saveAppSettings(appSettings);

    return {
      ...state,
      appSettings,
    };
  }

  if (!state.career) {
    return state;
  }

  return {
    ...state,
    career: markCareerGuideSeen(state.career, action.guideId),
  };
}
