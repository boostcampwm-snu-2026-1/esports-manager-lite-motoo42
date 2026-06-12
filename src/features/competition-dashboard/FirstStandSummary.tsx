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
        <p className="eyebrow">International</p>
        <h1>{competition.name}</h1>
        <span>{career.seasonState.currentDateLabel}</span>
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">Entrants</p>
        <strong>{entrants.length} teams</strong>
        <span>LCK 2 · LPL 2 · LEC/LCS/LCP/CBLOL 1</span>
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">LCK Seeds</p>
        <strong>{lckEntrants.map((entrant) => entrant.name).join(" / ")}</strong>
        <span>{lckEntrants[0]?.sourceDetail ?? "Waiting for LCK Cup result"}</span>
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">Status</p>
        <strong>
          {competition.completed
            ? competition.winnerTeamName ?? "Completed"
            : competition.currentStageName}
        </strong>
        <span>Top two per group advance</span>
      </article>
    </section>
  );
}
