import { useGameDispatch, useGameSelector } from "../app/GameProvider";
import type { AppRoute, OffseasonSubPage, RouteSubPage } from "../app/routes";
import { gameActions } from "../app/state";
import {
  hasSeenCareerGuide,
  OFFSEASON_RULES_GUIDE_ID,
} from "../domain/career/careerGuides";
import { OffseasonMarket } from "../features/offseason";
import { CareerRequiredFallback } from "./CareerRequiredFallback";
import type { CompetitionId } from "../types/game";

type OffseasonPageProps = {
  onGoTo: (
    route: AppRoute,
    options?: {
      competitionId?: CompetitionId | null;
      teamId?: string | null;
      subPage?: RouteSubPage | null;
      hash?: string | null;
    },
  ) => void;
  subPage?: OffseasonSubPage | null;
  onSubPageChange: (subPage: OffseasonSubPage) => void;
};

export function OffseasonPage({
  onGoTo,
  onSubPageChange,
  subPage,
}: OffseasonPageProps) {
  const career = useGameSelector((state) => state.career);
  const showFirstEntryGuides = useGameSelector(
    (state) => state.appSettings.guides.showFirstEntryGuides,
  );
  const dispatch = useGameDispatch();

  if (!career) {
    return <CareerRequiredFallback title="스토브리그를 열 수 없습니다" />;
  }

  return (
    <OffseasonMarket
      career={career}
      subPage={subPage}
      onCancelFreeAgentSigning={(offerId) =>
        dispatch(gameActions.cancelFreeAgentSigning(offerId))
      }
      onConfirmFreeAgentSigning={(offerId) =>
        dispatch(gameActions.confirmFreeAgentSigning(offerId))
      }
      onReleaseExpiredPlayer={(playerId) =>
        dispatch(gameActions.releaseExpiredOffseasonPlayer(playerId))
      }
      onSubmitFreeAgentOffer={(offer) =>
        dispatch(gameActions.submitFreeAgentOffer(offer))
      }
      onSubmitRenewalOffer={(offer) =>
        dispatch(gameActions.submitOffseasonRenewalOffer(offer))
      }
      onSubPageChange={onSubPageChange}
      onViewRoster={() => onGoTo("roster-builder")}
      showFirstEntryGuide={showFirstEntryGuides}
      hasSeenRulesGuide={hasSeenCareerGuide(career, OFFSEASON_RULES_GUIDE_ID)}
      onMarkRulesGuideSeen={() =>
        dispatch(gameActions.markCareerGuideSeen(OFFSEASON_RULES_GUIDE_ID))
      }
    />
  );
}
