import type { MatchWeekOpponentReport } from "./matchWeekTypes";

type OpponentReportViewProps = {
  opponentReport: MatchWeekOpponentReport;
};

function getStrengthLabel(strength: number) {
  if (strength >= 88) {
    return "리그 최상위권 전력";
  }

  if (strength >= 82) {
    return "상위권 경쟁 전력";
  }

  if (strength >= 76) {
    return "중위권 이상 전력";
  }

  return "기복을 노릴 수 있는 전력";
}

function getStylePreparation(styleLabel: string) {
  if (styleLabel.includes("운영")) {
    return "시야와 오브젝트 교환 구도를 먼저 정리하고, 중반 사이드 운영에서 손해를 누적하지 않는 준비가 필요합니다.";
  }

  if (styleLabel.includes("템포")) {
    return "초반 교전 합류와 첫 전령 타이밍을 안정적으로 넘기는 것이 핵심입니다.";
  }

  if (styleLabel.includes("공격")) {
    return "라인전 손실을 줄이고 역습 가능한 교전 구도를 미리 준비하는 편이 좋습니다.";
  }

  if (styleLabel.includes("후반")) {
    return "초중반 주도권을 통해 성장 시간을 제한하고, 후반 조합 완성 전에 격차를 벌리는 계획이 어울립니다.";
  }

  return "상대 스타일이 뚜렷하게 한쪽으로 치우치지 않으므로 기본기와 밴픽 안정성을 함께 점검하는 편이 좋습니다.";
}

function getThreatSummary(opponentReport: MatchWeekOpponentReport) {
  const keyLane = opponentReport.keyLaneLabel ?? "핵심 라인 정보 없음";

  return `${keyLane}을 중심으로 상대의 강점이 드러납니다. 전력 지표는 ${getStrengthLabel(
    opponentReport.strength,
  )}으로 분류됩니다.`;
}

export function OpponentReportView({ opponentReport }: OpponentReportViewProps) {
  return (
    <div className="match-week-report-view">
      <section className="match-week-report-hero">
        <div>
          <p className="eyebrow">상대 개요</p>
          <h3>{opponentReport.opponentTeamName}</h3>
          <p>
            {opponentReport.competitionName} {opponentReport.stageName}에서
            만나는 다음 상대입니다. {opponentReport.formatLabel} 기준으로
            준비합니다.
          </p>
        </div>
        <div className="match-week-report-score">
          <span>상대 전력</span>
          <strong>{opponentReport.strength}</strong>
          <small>{opponentReport.outlookGrade ?? "전망 분석 대기"}</small>
        </div>
      </section>

      <div className="match-week-report-grid match-week-report-fact-grid">
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

      <div className="match-week-report-insight-grid">
        <article>
          <span>핵심 위협</span>
          <strong>{getThreatSummary(opponentReport)}</strong>
        </article>
        <article>
          <span>준비 포인트</span>
          <strong>{getStylePreparation(opponentReport.styleLabel)}</strong>
        </article>
        <article>
          <span>우리 팀 체크</span>
          <strong>
            {opponentReport.statusSummary ??
              "선발 평균 폼과 피로도를 확인한 뒤 전략/스크림 계획을 조정하세요."}
          </strong>
        </article>
      </div>
    </div>
  );
}
