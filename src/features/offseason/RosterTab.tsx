import { validateOffseasonRoster } from "../../domain/season";
import { formatSalaryRange } from "../../shared/format/money";
import { Button } from "../../shared/ui/Button";
import { EvaluationStars } from "../../shared/ui/EvaluationStars";
import type { CareerSave, Player } from "../../types/game";
import { getPlayer, getPlayerLabel } from "./offseasonMarketShared";

export function RosterTab({
  career,
  onViewRoster,
}: {
  career: CareerSave;
  onViewRoster: () => void;
}) {
  const validation = validateOffseasonRoster(career, {
    academyPolicy: "auto-fill",
  });
  const rosteredPlayers = career.userTeam.contracts
    .filter((contract) => contract.remainingYears > 0)
    .map((contract) => getPlayer(career.lckPlayers, contract.playerId))
    .filter(
      (player): player is Player =>
        player !== undefined && player.availableForRoster,
    );
  const minMainRosterPlayers =
    career.userTeam.rosterSettings.minMainRosterPlayers ?? 5;
  const minAcademyRosterPlayers =
    career.userTeam.rosterSettings.minAcademyRosterPlayers ?? 5;

  return (
    <div className="offseason-roster-panel">
      <div className="season-summary-metrics">
        <article className="season-summary-metric">
          <span>계약 선수</span>
          <strong>{validation.contractedPlayerIds.length}명</strong>
          <small>
            자동 보정 후 최대{" "}
            {career.userTeam.rosterSettings.maxPlayers}명
          </small>
        </article>
        <article className="season-summary-metric">
          <span>1군 등록</span>
          <strong>
            {validation.mainRosterPlayerIds.length}/{minMainRosterPlayers}
          </strong>
          <small>선발 5인 + 1군 후보</small>
        </article>
        <article className="season-summary-metric">
          <span>2군 등록</span>
          <strong>
            {validation.academyPlayerIds.length}/{minAcademyRosterPlayers}
          </strong>
          <small>부족분은 최종 등록 시 자동 배치</small>
        </article>
        <article className="season-summary-metric">
          <span>연봉 총액</span>
          <strong>{formatSalaryRange(validation.yearlySalary, career.userTeam.budget)}</strong>
          <small>예산 기준</small>
        </article>
        <article className="season-summary-metric">
          <span>최종 등록</span>
          <strong>{validation.isValid ? "가능" : "불가"}</strong>
          <small>28일차 진행 시 검사</small>
        </article>
      </div>
      {validation.errors.length > 0 && (
        <div className="offseason-validation-box">
          {validation.errors.map((error) => (
            <span key={error}>{error}</span>
          ))}
        </div>
      )}
      <div className="offseason-roster-list">
        {rosteredPlayers.map((player) => (
          <article className="offseason-mini-player" key={player.id}>
            <strong>{player.name}</strong>
            <span>{getPlayerLabel(player)}</span>
            <EvaluationStars compact player={player} />
          </article>
        ))}
      </div>
      <div className="season-summary-actions">
        <Button variant="ghost" onClick={onViewRoster}>
          선발/2군 조정
        </Button>
      </div>
    </div>
  );
}
