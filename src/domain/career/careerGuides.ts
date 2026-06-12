import type { CareerGuideId, CareerGuideState, CareerSave } from "../../types/game";

export const OFFSEASON_RULES_GUIDE_ID: CareerGuideId = "offseason-rules";

const knownCareerGuideIds = new Set<CareerGuideId>([
  OFFSEASON_RULES_GUIDE_ID,
]);

function normalizeGuideIds(value: unknown): CareerGuideId[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value.filter((guideId): guideId is CareerGuideId =>
        knownCareerGuideIds.has(guideId as CareerGuideId),
      ),
    ),
  ];
}

export function normalizeCareerGuideState(
  value: Partial<CareerGuideState> | undefined,
): CareerGuideState {
  return {
    seenGuideIds: normalizeGuideIds(value?.seenGuideIds),
  };
}

export function hasSeenCareerGuide(
  career: CareerSave,
  guideId: CareerGuideId,
) {
  return career.guideState?.seenGuideIds.includes(guideId) ?? false;
}

export function markCareerGuideSeen(
  career: CareerSave,
  guideId: CareerGuideId,
): CareerSave {
  const guideState = normalizeCareerGuideState(career.guideState);

  if (guideState.seenGuideIds.includes(guideId)) {
    return {
      ...career,
      guideState,
    };
  }

  return {
    ...career,
    guideState: {
      seenGuideIds: [...guideState.seenGuideIds, guideId],
    },
  };
}
