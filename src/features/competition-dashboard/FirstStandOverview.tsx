import type { FirstStandEntrant } from "./firstStandModel";

function FirstStandEntrantCard({ entrant }: { entrant: FirstStandEntrant }) {
  return (
    <article
      className={`first-stand-entrant-card ${
        entrant.isLck ? "first-stand-entrant-lck" : ""
      } ${entrant.isPlaceholder ? "first-stand-entrant-placeholder" : ""}`}
    >
      <span>{entrant.seedLabel}</span>
      <strong>{entrant.name}</strong>
      <small>
        {entrant.leagueLabel} · Group {entrant.group}
      </small>
      <em>{entrant.sourceDetail}</em>
    </article>
  );
}

export function FirstStandOverview({
  entrants,
}: {
  entrants: FirstStandEntrant[];
}) {
  return (
    <section className="competition-panel first-stand-main-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Entrants</h2>
        </div>
        <span className="panel-note">LCK and LPL seeds are split across groups</span>
      </div>
      <div className="first-stand-entrant-grid">
        {entrants.map((entrant) => (
          <FirstStandEntrantCard entrant={entrant} key={entrant.id} />
        ))}
      </div>
      <div className="first-stand-format-strip">
        <span>Group Stage · 2 groups of 4 · BO1</span>
        <span>Semifinals · BO5</span>
        <span>Final · BO5</span>
      </div>
      <p className="competition-overview-copy">
        First Stand는 LCK Cup 이후 열리는 첫 국제전입니다. LCK/LPL 대표와
        주요 지역 대표가 조별리그를 거쳐 BO5 토너먼트로 첫 국제 우승팀을
        가립니다.
      </p>
    </section>
  );
}
