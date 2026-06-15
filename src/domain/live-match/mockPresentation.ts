import type { CareerSave } from "../../types/game";
import { createLiveMatchPresentationFromCareer } from "./presentationFactory";

export function createMockLiveMatchPresentation(career: CareerSave | null) {
  return createLiveMatchPresentationFromCareer(career);
}
