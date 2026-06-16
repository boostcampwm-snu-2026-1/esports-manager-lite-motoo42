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

function getScrimStatusSummary(
  acceptedCount: number,
  pendingCount: number,
  totalCount: number,
) {
  if (totalCount === 0) {
    return "이번 주 예정된 스크림이 없습니다.";
  }

  if (pendingCount > 0 && acceptedCount > 0) {
    return `${acceptedCount}건 확정, ${pendingCount}건 응답 대기 중입니다.`;
  }

  if (pendingCount > 0) {
    return `${pendingCount}건의 요청이 응답 대기 중입니다.`;
  }

  return `${acceptedCount}건의 스크림이 확정되어 있습니다.`;
}

export function WeeklyPlanView({ career, weeklyPlan }: WeeklyPlanViewProps) {
  const selectedStrategy = getSelectedStrategy(weeklyPlan);
  const summary = getWeeklyPlanSummary(weeklyPlan);
  const weeklyScrims = getCurrentWeekScrims(career);
  const acceptedScrimCount = weeklyScrims.filter(
    (scrim) => scrim.status === "accepted",
  ).length;
  const pendingScrimCount = weeklyScrims.filter(
    (scrim) => scrim.status === "pending",
  ).length;
  const nextScrim = weeklyScrims[0];

  return (
    <div className="strategy-panel strategy-panel-plan">
      <section className="weekly-plan-dashboard">
        <article className="strategy-plan-summary strategy-plan-summary-active weekly-plan-focus">
          <p className="eyebrow">주간 계획</p>
          <h3>{selectedStrategy?.label ?? "균형 전술"}</h3>
          <p>
            다음 공식 경기는 현재 전략의 선수 능력치 적합도를 중심으로
            준비합니다. 필요한 실전 감각은 스크림 메뉴에서 보강합니다.
          </p>
        </article>

        <div className="weekly-plan-card-grid">
          <article>
            <span>전술 효과</span>
            <strong>{summary.strategyEffect}</strong>
          </article>
          <article>
            <span>이번 주 스크림</span>
            <strong>
              {getScrimStatusSummary(
                acceptedScrimCount,
                pendingScrimCount,
                weeklyScrims.length,
              )}
            </strong>
          </article>
          <article>
            <span>다음 행동</span>
            <strong>
              {weeklyScrims.length > 0
                ? "확정된 일정은 스크림 메뉴에서 진행하고, 응답 대기 요청은 다음날 결과를 확인하세요."
                : "공식 경기 전 1주일 범위에서 스크림 요청을 검토하세요."}
            </strong>
          </article>
        </div>
      </section>

      <section className="strategy-selection-summary">
        <article>
          <span>현재 전략</span>
          <strong>{selectedStrategy?.label ?? "균형 전술"}</strong>
          <small>{selectedStrategy?.effectSummary}</small>
        </article>
        <article>
          <span>가장 가까운 스크림</span>
          <strong>{nextScrim?.opponentTeamName ?? "비어 있음"}</strong>
          <small>
            {nextScrim
              ? `${nextScrim.scheduledDateLabel} · ${nextScrim.matchCount}경기 · ${
                  nextScrim.status === "accepted" ? "확정" : "응답 대기"
                }`
              : "스크림 메뉴에서 1주일 이내 날짜와 상대를 선택할 수 있습니다."}
          </small>
        </article>
        {weeklyScrims.length === 0 ? (
          <article>
            <span>주간 상태</span>
            <strong>공식 경기 준비 전</strong>
            <small>상대 리포트를 확인하고 전략 또는 스크림 계획을 조정하세요.</small>
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
