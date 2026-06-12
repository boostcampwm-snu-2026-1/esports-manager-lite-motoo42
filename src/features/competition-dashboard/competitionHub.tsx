import { getCompetitionTemplate } from "../../data/competitions";
import type { CareerSave, CompetitionId, CompetitionState } from "../../types/game";
import { getDateLabel, getStatusText } from "./competitionDashboardFormatters";
import { getNextWeekMatches } from "./competitionDashboardSchedule";

export function getCurrentCompetition(
  career: CareerSave,
  competitionId?: CompetitionId | null,
) {
  if (competitionId === null) {
    return undefined;
  }

  const targetCompetitionId =
    competitionId ?? career.seasonState.currentCompetitionId;

  return career.seasonState.competitions.find(
    (competition) => competition.competitionId === targetCompetitionId,
  );
}

export function getCompetitionScopeLabel(competition: CompetitionState) {
  const template = getCompetitionTemplate(competition.competitionId);

  if (template?.scope === "lck") {
    return "LCK";
  }

  if (template?.scope === "international") {
    return "국제대회";
  }

  return "특별 대회";
}

export function CompetitionListView({
  career,
  onSelectCompetition,
}: {
  career: CareerSave;
  onSelectCompetition?: (competitionId: CompetitionId) => void;
}) {
  const currentCompetitionId = career.seasonState.currentCompetitionId;

  return (
    <section className="competition-dashboard competition-hub-page">
      <header>
        <p className="eyebrow">Competition Hub</p>
        <h1>대회 목록</h1>
        <p className="lede">
          현재 시즌의 국내외 대회를 선택해 순위표, 일정, 브래킷을 확인합니다.
        </p>
      </header>

      <div className="competition-hub-grid">
        {career.seasonState.competitions.map((competition) => {
          const template = getCompetitionTemplate(competition.competitionId);
          const isCurrent = competition.competitionId === currentCompetitionId;

          return (
            <button
              className={`competition-hub-card ${
                isCurrent ? "competition-hub-card-current" : ""
              }`}
              key={competition.competitionId}
              onClick={() => onSelectCompetition?.(competition.competitionId)}
              type="button"
            >
              <div className="competition-hub-card-header">
                <span>{getCompetitionScopeLabel(competition)}</span>
                <strong>{competition.name}</strong>
              </div>
              <dl>
                <div>
                  <dt>상태</dt>
                  <dd>{getStatusText(competition)}</dd>
                </div>
                <div>
                  <dt>현재 주차</dt>
                  <dd>{competition.currentWeek}주차</dd>
                </div>
                <div>
                  <dt>참가 규모</dt>
                  <dd>{template?.entrantsSummary ?? "참가팀 미정"}</dd>
                </div>
                <div>
                  <dt>다음 경기</dt>
                  <dd>
                    {getNextWeekMatches(competition)[0]
                      ? getDateLabel(
                          getNextWeekMatches(competition)[0].scheduledDate,
                        )
                      : "예정 경기 없음"}
                  </dd>
                </div>
              </dl>
              <p>{template?.formatSummary ?? "대회 포맷 정보가 준비 중입니다."}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
