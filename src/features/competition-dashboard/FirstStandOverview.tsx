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
        {entrant.leagueLabel} · {entrant.group}조
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
          <p className="eyebrow">개요</p>
          <h2>참가팀</h2>
        </div>
        <span className="panel-note">LCK와 LPL 시드는 두 조에 나뉘어 배치됩니다</span>
      </div>
      <div className="first-stand-entrant-grid">
        {entrants.map((entrant) => (
          <FirstStandEntrantCard entrant={entrant} key={entrant.id} />
        ))}
      </div>
      <div className="first-stand-format-strip">
        <span>조별리그 · 4팀 2개 조 · BO1</span>
        <span>준결승 · BO5</span>
        <span>결승 · BO5</span>
      </div>
      <p className="competition-overview-copy">
        First Stand는 LCK Cup 이후 열리는 첫 국제전입니다. LCK/LPL 대표와
        주요 지역 대표가 조별리그를 거쳐 BO5 토너먼트로 첫 국제 우승팀을
        가립니다.
      </p>
    </section>
  );
}
