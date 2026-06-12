import type { CompetitionState, MatchRecord } from "../../types/game";
import {
  getFormatLabel,
  getMatchTitle,
  getRecordByScheduleId,
  getScheduleStatusClass,
  groupMatchesByDate,
} from "./competitionDashboardShared";
import {
  createFirstStandPreviewMatches,
  type FirstStandEntrant,
} from "./firstStandModel";
import {
  formatFirstStandDateLabel,
  getFirstStandMatchStatusLabel,
  isFirstStandUserMatch,
} from "./firstStandShared";

export function FirstStandScheduleView({
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
  const recordsByScheduleId = getRecordByScheduleId(records);
  const groupedSchedule = groupMatchesByDate(competition.schedule);
  const previewMatches = createFirstStandPreviewMatches(entrants);

  return (
    <section className="competition-panel first-stand-main-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Schedule</p>
          <h2>Schedule / Results</h2>
        </div>
        <span className="panel-note">Actual First Stand fixtures, scores, and user-team highlights</span>
      </div>
      <div className="first-stand-schedule-scroll">
        {groupedSchedule.length > 0
          ? groupedSchedule.map(({ dateKey, matches }) => (
              <article className="first-stand-schedule-day" key={dateKey}>
                <header>
                  <strong>{formatFirstStandDateLabel(dateKey)}</strong>
                  <span>{matches.length} matches</span>
                </header>
                <div className="first-stand-schedule-day-list">
                  {matches.map((match) => {
                    const record = recordsByScheduleId.get(match.id);
                    const isUserMatch = isFirstStandUserMatch(match, userTeamId);

                    return (
                      <div
                        className={`first-stand-schedule-row ${
                          isUserMatch ? "first-stand-schedule-row-user" : ""
                        }`}
                        key={match.id}
                      >
                        <div>
                          <strong>{getMatchTitle(match)}</strong>
                          <span>
                            {match.stageName} · {getFormatLabel(match)}
                          </span>
                        </div>
                        <b
                          className={`schedule-status-badge ${
                            getScheduleStatusClass({ match, record, userTeamId })
                          }`}
                        >
                          {getFirstStandMatchStatusLabel(match, record)}
                        </b>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))
          : previewMatches.map((match) => (
              <article className="first-stand-schedule-row" key={match.id}>
                <div>
                  <strong>
                    {match.blueTeamName} vs {match.redTeamName}
                  </strong>
                  <span>
                    {match.dateLabel} · {match.stageName} · Group {match.group}
                  </span>
                </div>
                <b className="schedule-status-badge schedule-status-scheduled">
                  {match.formatLabel} · Scheduled
                </b>
              </article>
            ))}
      </div>
    </section>
  );
}
