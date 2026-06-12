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
        <p className="eyebrow">Group {group}</p>
        <strong>Standings</strong>
      </header>
      <div className="first-stand-group-table first-stand-group-table-header">
        <span>Rank</span>
        <span>Team</span>
        <span>Played</span>
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
          <p className="eyebrow">Group Stage</p>
          <h2>Group Standings</h2>
        </div>
        <span className="panel-note">Top two teams per group advance to the BO5 bracket</span>
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
