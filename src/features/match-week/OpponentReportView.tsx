import type { MatchWeekOpponentReport } from "./matchWeekTypes";

type OpponentReportViewProps = {
  opponentReport: MatchWeekOpponentReport;
};

export function OpponentReportView({ opponentReport }: OpponentReportViewProps) {
  return (
    <div className="match-week-report-view">
      <div className="match-week-report-grid">
        <article>
          <span>대회</span>
          <strong>{opponentReport.competitionName}</strong>
        </article>
        <article>
          <span>스테이지</span>
          <strong>{opponentReport.stageName}</strong>
        </article>
        <article>
          <span>포맷</span>
          <strong>{opponentReport.formatLabel}</strong>
        </article>
        <article>
          <span>상대 스타일</span>
          <strong>{opponentReport.styleLabel}</strong>
        </article>
        <article>
          <span>상대 전력</span>
          <strong>{opponentReport.strength}</strong>
        </article>
        {opponentReport.outlookGrade && (
          <article>
            <span>전망</span>
            <strong>{opponentReport.outlookGrade}</strong>
          </article>
        )}
        {opponentReport.keyLaneLabel && (
          <article className="match-week-report-wide">
            <span>핵심 라인</span>
            <strong>{opponentReport.keyLaneLabel}</strong>
          </article>
        )}
        {opponentReport.statusSummary && (
          <article className="match-week-report-wide">
            <span>우리 상태</span>
            <strong>{opponentReport.statusSummary}</strong>
          </article>
        )}
      </div>
    </div>
  );
}
