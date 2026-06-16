import { Button } from "../../shared/ui/Button";
import type { CareerSave, StrategyId, WeeklyPlan } from "../../types/game";
import type { TrainingSubPage } from "../../app/routes";
import type { ScrimRequestInput } from "../../domain/scrim";
import { OpponentReportView } from "./OpponentReportView";
import { StrategyPanel } from "./StrategyPanel";
import type { MatchWeekOpponentReport } from "./matchWeekTypes";

type MatchWeekProps = {
  opponentReport: MatchWeekOpponentReport;
  subPage?: TrainingSubPage | null;
  career: CareerSave;
  weeklyPlan: WeeklyPlan;
  onStrategyChange: (strategy: StrategyId) => void;
  onRequestScrim: (request: ScrimRequestInput) => void;
  onRunTodayScrim: () => void;
  onViewCalendar: () => void;
};

function getMatchWeekSubPageTitle(subPage: TrainingSubPage | null | undefined) {
  if (subPage === "report" || !subPage) {
    return {
      eyebrow: "상대 분석",
      title: "상대 리포트",
      description: "다음 일정 기준 상대와 우리 팀 상태를 확인합니다.",
    };
  }

  if (subPage === "strategy") {
    return {
      eyebrow: "전략",
      title: "전략",
      description: "다음 경기에서 우선할 운영 방향을 고릅니다.",
    };
  }

  if (subPage === "scrim") {
    return {
      eyebrow: "스크림",
      title: "스크림",
      description: "공식 경기 ELO를 바꾸지 않는 연습 경기를 요청하고 진행합니다.",
    };
  }

  return {
    eyebrow: "주간 계획",
    title: "주간 계획",
    description: "현재 전략과 이번 주 스크림 일정을 확인합니다.",
  };
}

export function MatchWeek({
  opponentReport,
  subPage,
  career,
  weeklyPlan,
  onStrategyChange,
  onRequestScrim,
  onRunTodayScrim,
  onViewCalendar,
}: MatchWeekProps) {
  const activeSubPage = subPage ?? "report";
  const subPageTitle = getMatchWeekSubPageTitle(activeSubPage);

  return (
    <section className="stack match-week-page">
      <header>
        <p className="eyebrow">Match week</p>
        <h1>다음 상대: {opponentReport.opponentTeamName}</h1>
        <p className="lede">
          공식 경기 전 상대 분석, 전략 선택, 스크림 일정을 한 곳에서 조정합니다.
        </p>
      </header>

      <div className="match-week-layout">
        <section className="card match-week-workspace-card">
          <div className="match-week-subpage-heading">
            <div>
              <p className="eyebrow">{subPageTitle.eyebrow}</p>
              <h2>{subPageTitle.title}</h2>
            </div>
            <div className="match-week-subpage-meta">
              <span>{subPageTitle.description}</span>
              <Button onClick={onViewCalendar}>시즌 일정 보기</Button>
            </div>
          </div>
          {activeSubPage === "report" ? (
            <OpponentReportView opponentReport={opponentReport} />
          ) : (
            <StrategyPanel
              career={career}
              subPage={activeSubPage}
              weeklyPlan={weeklyPlan}
              onStrategyChange={onStrategyChange}
              onRequestScrim={onRequestScrim}
              onRunTodayScrim={onRunTodayScrim}
            />
          )}
        </section>
      </div>
    </section>
  );
}
