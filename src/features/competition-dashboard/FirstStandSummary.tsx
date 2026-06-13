import type { CareerSave, CompetitionState } from "../../types/game";
import type { FirstStandEntrant } from "./firstStandModel";

export function FirstStandSummary({
  career,
  competition,
  entrants,
}: {
  career: CareerSave;
  competition: CompetitionState;
  entrants: FirstStandEntrant[];
}) {
  const lckEntrants = entrants.filter((entrant) => entrant.isLck);

  return (
    <section className="competition-summary-grid competition-summary-grid-compact">
      <article className="competition-summary-card competition-summary-card-wide">
        <p className="eyebrow">국제대회</p>
        <h1>{competition.name}</h1>
        <span>{career.seasonState.currentDateLabel}</span>
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">참가팀</p>
        <strong>{entrants.length}팀</strong>
        <span>LCK 2 · LPL 2 · LEC/LCS/LCP/CBLOL 1</span>
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">LCK 시드</p>
        <strong>{lckEntrants.map((entrant) => entrant.name).join(" / ")}</strong>
        <span>{lckEntrants[0]?.sourceDetail ?? "LCK Cup 결과 대기"}</span>
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">상태</p>
        <strong>
          {competition.completed
            ? competition.winnerTeamName ?? "완료"
            : competition.currentStageName}
        </strong>
        <span>각 조 상위 2팀 진출</span>
      </article>
    </section>
  );
}
