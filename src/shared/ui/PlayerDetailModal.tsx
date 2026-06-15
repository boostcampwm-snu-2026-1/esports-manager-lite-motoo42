import type { ReactNode } from "react";
import { getLckTeamDisplayName } from "../../data/lckTeams";
import { computeRoleOverall, getAttributeTier } from "../../domain/player-attributes";
import {
  getPlayerCareerEntries,
  getPlayerProfileSummary,
} from "../../domain/players";
import { getMoraleLabel } from "../../domain/player-status";
import type { Player, PlayerContract, Role } from "../../types/game";
import { formatSalaryAmount } from "../format/money";
import { EvaluationStars } from "./EvaluationStars";
import { MoraleIndicator } from "./MoraleIndicator";
import { PlayerAttributePanel } from "./PlayerAttributePanel";
import { PlayerPortrait } from "./PlayerPortrait";

type PlayerDetailModalProps = {
  contract?: PlayerContract;
  extraContent?: ReactNode;
  onClose: () => void;
  player: Player;
  rosterLabel?: string;
  titlePrefix?: string;
};

const roleLabels: Record<Role, string> = {
  top: "탑",
  jungle: "정글",
  mid: "미드",
  bot: "원딜",
  support: "서폿",
};

function StatusMetric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <article className="player-profile-status-cell">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export function PlayerDetailModal({
  contract,
  extraContent,
  onClose,
  player,
  rosterLabel,
  titlePrefix = "Player Profile",
}: PlayerDetailModalProps) {
  const currentTeamLabel = player.currentTeam
    ? getLckTeamDisplayName(player.currentTeam)
    : "FA";
  const careerEntries = getPlayerCareerEntries(player);
  const overall = computeRoleOverall(player);
  const overallTier = getAttributeTier(overall);
  const contractTerm = contract
    ? `${contract.guaranteedYears}년${contract.optionYear ? " +옵션" : ""}`
    : "—";
  const salaryLabel = contract ? "연봉" : "예상 연봉";
  const salaryValue = formatSalaryAmount(
    contract ? contract.salary : player.salaryExpectation,
  );

  return (
    <div
      aria-label={`${player.name} 선수 상세`}
      aria-modal="true"
      className="player-profile-screen"
      role="dialog"
    >
      <header className="player-profile-topbar">
        <button
          aria-label="닫기"
          className="player-profile-back"
          onClick={onClose}
          type="button"
        >
          <span aria-hidden="true">←</span> 선수 프로필
        </button>
        <span className="player-profile-context">{titlePrefix}</span>
      </header>

      <div className="player-profile-cols">
        <section className="player-profile-left" aria-label="선수 정보">
          <PlayerPortrait
            className="player-profile-portrait"
            player={player}
            size="lg"
          />
          <h2 className="player-profile-name">{player.name}</h2>
          <p className="player-profile-subtitle">
            {roleLabels[player.role]} · {player.age}세 · {currentTeamLabel}
            {rosterLabel ? ` · ${rosterLabel}` : ""}
          </p>
          <EvaluationStars player={player} />

          <div className="player-profile-status-grid">
            <StatusMetric label="컨디션" value={player.status.condition} />
            <StatusMetric label="피로도" value={player.status.fatigue} />
            <StatusMetric label="부상 위험" value={player.status.injuryRisk} />
            <StatusMetric
              label="사기"
              value={
                <span className="player-detail-morale-value">
                  <MoraleIndicator level={player.status.morale} />
                  {getMoraleLabel(player.status.morale)}
                </span>
              }
            />
          </div>

          <div className="player-profile-zone-label">계약</div>
          <div className="player-profile-contract">
            <div className="player-profile-contract-row">
              <span>계약 기간</span>
              <strong>{contractTerm}</strong>
            </div>
            <div className="player-profile-contract-row">
              <span>{salaryLabel}</span>
              <strong>{salaryValue}</strong>
            </div>
          </div>
        </section>

        <section className="player-profile-center" aria-label="세부 능력치">
          <div className="player-profile-zone-label">능력치</div>
          <PlayerAttributePanel player={player} />
        </section>

        <section className="player-profile-right" aria-label="평가 및 커리어">
          <div className="player-profile-overall-card">
            <span>포지션 종합</span>
            <strong className={`player-attr-tier-${overallTier}`}>
              {overall}
            </strong>
            <small>잠재 {player.potential}</small>
          </div>

          <p className="player-profile-summary">
            {getPlayerProfileSummary(player)}
          </p>

          <div className="player-profile-zone-label">특징</div>
          <div className="trait-row">
            {player.traits.length > 0 ? (
              player.traits.map((trait) => <span key={trait}>{trait}</span>)
            ) : (
              <span>기록된 특징 없음</span>
            )}
          </div>

          <div className="player-profile-career">
            <div className="panel-title-row">
              <div>
                <p className="eyebrow">Career</p>
                <h3>커리어</h3>
              </div>
              <span className="panel-note">대표 기록 / 현재 소속 기반</span>
            </div>
            <div className="player-profile-career-list">
              {careerEntries.map((entry) => (
                <article
                  className="player-profile-career-entry"
                  key={`${entry.teamName}-${entry.period}`}
                >
                  <strong>{entry.teamName}</strong>
                  <span>{entry.period}</span>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      {extraContent ? (
        <div className="player-profile-extra">{extraContent}</div>
      ) : null}
    </div>
  );
}
