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
  getFirstStandStageLabel,
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
          <p className="eyebrow">일정</p>
          <h2>일정 / 결과</h2>
        </div>
        <span className="panel-note">실제 일정, 스코어, 우리 팀 경기 강조</span>
      </div>
      <div className="first-stand-schedule-scroll">
        {groupedSchedule.length > 0
          ? groupedSchedule.map(({ dateKey, matches }) => (
              <article className="first-stand-schedule-day" key={dateKey}>
                <header>
                  <strong>{formatFirstStandDateLabel(dateKey)}</strong>
                  <span>{matches.length}경기</span>
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
                            {getFirstStandStageLabel(match.stageName)} ·{" "}
                            {getFormatLabel(match)}
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
                    {match.dateLabel} · {getFirstStandStageLabel(match.stageName)} ·{" "}
                    {match.group}조
                  </span>
                </div>
                <b className="schedule-status-badge schedule-status-scheduled">
                  {match.formatLabel} · 예정
                </b>
              </article>
            ))}
      </div>
    </section>
  );
}
