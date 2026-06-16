import type { CareerSave, MatchSeriesReplay } from "../../types/game";
import { createLiveMatchPresentationFromCareer } from "./presentationFactory";

export function createMockLiveMatchPresentation(
  career: CareerSave | null,
  series?: MatchSeriesReplay | null,
) {
  return createLiveMatchPresentationFromCareer(career, series);
}
