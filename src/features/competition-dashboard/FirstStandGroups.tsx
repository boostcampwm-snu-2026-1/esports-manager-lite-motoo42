import { getFirstStandGroupStandings } from "../../domain/season";
import type { CompetitionState, MatchRecord } from "../../types/game";
import { getMatchCount } from "./competitionDashboardShared";
import {
  getFallbackFirstStandGroupRows,
  type FirstStandEntrant,
  type FirstStandGroupId,
} from "./firstStandModel";
import { getFirstStandSetDiffLabel } from "./firstStandShared";

function FirstStandLiveGroupTable({
  competition,
  entrants,
  group,
  records,
  userTeamId,
}: {
  competition: CompetitionState;
  entrants: FirstStandEntrant[];
  group: FirstStandGroupId;
  records: MatchRecord[];
  userTeamId: string | undefined;
}) {
  const computedRows = getFirstStandGroupStandings(competition, records, group);
  const groupRows =
    computedRows.length > 0
      ? computedRows
      : getFallbackFirstStandGroupRows(entrants, group);

  return (
    <article className="first-stand-group-card">
      <header>
        <p className="eyebrow">{group}조</p>
        <strong>순위표</strong>
      </header>
      <div className="first-stand-group-table first-stand-group-table-header">
        <span>순위</span>
        <span>팀</span>
        <span>경기</span>
        <span>W</span>
        <span>L</span>
        <span>Set +/-</span>
      </div>
      {groupRows.map((entry, index) => (
        <div
          className={`first-stand-group-table ${
            entry.teamId === userTeamId ? "first-stand-group-row-lck" : ""
          }`}
          key={entry.teamId}
        >
          <span>{index + 1}</span>
          <strong>{entry.teamName}</strong>
          <span>{getMatchCount(entry)}</span>
          <span>{entry.wins}</span>
          <span>{entry.losses}</span>
          <span>{getFirstStandSetDiffLabel(entry)}</span>
        </div>
      ))}
    </article>
  );
}

export function FirstStandGroupsView({
  competition,
  entrants,
  records,
  userTeamId,
}: {
  competition: CompetitionState;
  entrants: FirstStandEntrant[];
  records: MatchRecord[];
  userTeamId: string | undefined;
}) {
  return (
    <section className="competition-panel first-stand-main-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">조별리그</p>
          <h2>조별 순위</h2>
        </div>
        <span className="panel-note">각 조 상위 2팀이 BO5 토너먼트에 진출합니다</span>
      </div>
      <div className="first-stand-groups-grid">
        <FirstStandLiveGroupTable
          competition={competition}
          entrants={entrants}
          group="A"
          records={records}
          userTeamId={userTeamId}
        />
        <FirstStandLiveGroupTable
          competition={competition}
          entrants={entrants}
          group="B"
          records={records}
          userTeamId={userTeamId}
        />
      </div>
    </section>
  );
}
