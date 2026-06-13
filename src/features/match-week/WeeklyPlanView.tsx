import { getCurrentWeekScrims } from "../../domain/scrim";
import type { CareerSave, WeeklyPlan } from "../../types/game";
import {
  getSelectedStrategy,
  getWeeklyPlanSummary,
} from "./weeklyPlanViewModel";

type WeeklyPlanViewProps = {
  career: CareerSave;
  weeklyPlan: WeeklyPlan;
};

export function WeeklyPlanView({ career, weeklyPlan }: WeeklyPlanViewProps) {
  const selectedStrategy = getSelectedStrategy(weeklyPlan);
  const summary = getWeeklyPlanSummary(weeklyPlan);
  const weeklyScrims = getCurrentWeekScrims(career);

  return (
    <div className="strategy-panel strategy-panel-plan">
      <section className="strategy-plan-summary strategy-plan-summary-active">
        <p className="eyebrow">주간 계획</p>
        <h3>{selectedStrategy?.label ?? "균형 전술"}</h3>
        <p>
          다음 공식 경기는 현재 전략의 선수 능력치 적합도를 중심으로 준비합니다.
          스크림은 별도 메뉴에서 요청하고 진행합니다.
        </p>
        <dl>
          <div>
            <dt>전술 효과</dt>
            <dd>{summary.strategyEffect}</dd>
          </div>
          <div>
            <dt>이번 주 스크림</dt>
            <dd>
              {weeklyScrims.length > 0
                ? `${weeklyScrims.length}건 예정 또는 응답 대기`
                : "예정된 스크림 없음"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="strategy-selection-summary">
        <article>
          <span>현재 전략</span>
          <strong>{selectedStrategy?.label ?? "균형 전술"}</strong>
          <small>{selectedStrategy?.effectSummary}</small>
        </article>
        {weeklyScrims.length === 0 ? (
          <article>
            <span>스크림 일정</span>
            <strong>비어 있음</strong>
            <small>스크림 메뉴에서 1주일 이내 날짜와 상대를 선택할 수 있습니다.</small>
          </article>
        ) : (
          weeklyScrims.slice(0, 3).map((scrim) => (
            <article key={scrim.id}>
              <span>{scrim.status === "accepted" ? "확정" : "응답 대기"}</span>
              <strong>{scrim.opponentTeamName}</strong>
              <small>
                {scrim.scheduledDateLabel} · {scrim.matchCount}경기
              </small>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
