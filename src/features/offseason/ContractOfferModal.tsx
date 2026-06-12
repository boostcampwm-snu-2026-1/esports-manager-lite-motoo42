import { useState } from "react";
import {
  getOffseasonNegotiationSnapshot,
  type OffseasonContractOfferInput,
} from "../../domain/season";
import { formatSalaryAmount } from "../../shared/format/money";
import { Button } from "../../shared/ui/Button";
import { EvaluationStars } from "../../shared/ui/EvaluationStars";
import { PlayerPortrait } from "../../shared/ui/PlayerPortrait";
import type {
  CareerSave,
  ContractType,
  OffseasonRequestedRosterRole,
} from "../../types/game";
import {
  contractOptions,
  findLatestOffer,
  getActiveSalaryTotal,
  getDefaultRequestedRosterRole,
  getNegotiationContext,
  getOfferStatusLabel,
  getPlayer,
  getPlayerLabel,
  getRequestedRosterRoleLabel,
  getVisibleDemand,
  requestedRosterRoleOptions,
  type NegotiationTarget,
} from "./offseasonMarketShared";

export function ContractOfferModal({
  career,
  onClose,
  onSubmit,
  target,
}: {
  career: CareerSave;
  onClose: () => void;
  onSubmit: (offer: OffseasonContractOfferInput) => void;
  target: NegotiationTarget;
}) {
  const player = getPlayer(career.lckPlayers, target.playerId);
  const [contractType, setContractType] = useState<ContractType>("one-year");
  const [requestedRosterRole, setRequestedRosterRole] =
    useState<OffseasonRequestedRosterRole>(() =>
      player
        ? getDefaultRequestedRosterRole({
            career,
            mode: target.mode,
            player,
          })
        : "academy",
    );
  const [salaryOffer, setSalaryOffer] = useState(() =>
    player
      ? getVisibleDemand({
          career,
          context: getNegotiationContext(target.mode),
          contractType: "one-year",
          player,
        })
      : 0,
  );

  if (!player) {
    return null;
  }

  const modalPlayer = player;
  const context = getNegotiationContext(target.mode);
  const negotiation = getOffseasonNegotiationSnapshot({
    career,
    context,
    contractType,
    player: modalPlayer,
    requestedRosterRole,
    salaryOffer,
  });
  const latestOffer = findLatestOffer(career, modalPlayer.id, context);
  const title = target.mode === "renewal" ? "재계약 협상" : "FA 계약 협상";
  const activeSalaryTotal = getActiveSalaryTotal(career);
  const projectedRemainingBudget =
    career.userTeam.budget - activeSalaryTotal - salaryOffer;

  function handleContractTypeChange(nextContractType: ContractType) {
    setContractType(nextContractType);
    setSalaryOffer(
      getVisibleDemand({
        career,
        context,
        contractType: nextContractType,
        player: modalPlayer,
      }),
    );
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose} role="presentation">
      <section
        aria-label={title}
        aria-modal="true"
        className="contract-offer-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="contract-offer-header">
          <div>
            <p className="eyebrow">{title}</p>
            <h2>{modalPlayer.name}</h2>
            <span>{getPlayerLabel(modalPlayer)}</span>
            <EvaluationStars player={modalPlayer} />
          </div>
          <button
            aria-label="닫기"
            className="modal-close-button"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="contract-offer-grid">
          <label>
            <span>계약 형태</span>
            <select
              value={contractType}
              onChange={(event) =>
                handleContractTypeChange(event.target.value as ContractType)
              }
            >
              {contractOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>제안 역할</span>
            <select
              aria-label="제안 역할"
              value={requestedRosterRole}
              onChange={(event) =>
                setRequestedRosterRole(
                  event.target.value as OffseasonRequestedRosterRole,
                )
              }
            >
              {requestedRosterRoleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <small>
              {
                requestedRosterRoleOptions.find(
                  (option) => option.value === requestedRosterRole,
                )?.description
              }
            </small>
          </label>
          <label>
            <span>제안 연봉</span>
            <input
              aria-label="제안 연봉"
              min={0}
              step={5}
              type="number"
              value={salaryOffer}
              onChange={(event) => setSalaryOffer(Number(event.target.value))}
            />
            <small>현재 제안: {formatSalaryAmount(salaryOffer)}</small>
          </label>
        </div>
        <div className="contract-offer-summary">
          <article>
            <span>선수 측 요구액</span>
            <strong>{formatSalaryAmount(negotiation.visibleDemand)}</strong>
          </article>
          <article
            className={
              projectedRemainingBudget < 0
                ? "contract-offer-budget-card contract-offer-budget-card-danger"
                : "contract-offer-budget-card"
            }
          >
            <span>제안 후 잔여 예산</span>
            <strong>{formatSalaryAmount(projectedRemainingBudget)}</strong>
            <small>
              현재 잔여 {formatSalaryAmount(career.userTeam.budget - activeSalaryTotal)}
            </small>
          </article>
          <article className="contract-offer-mood-card">
            <span>협상 분위기</span>
            <div className="negotiation-mood-value">
              <strong
                data-testid="negotiation-mood-score"
                style={{ color: negotiation.moodColor }}
              >
                {negotiation.moodScore}%
              </strong>
            </div>
            <div
              aria-label={`협상 분위기 ${negotiation.moodScore}%`}
              className="negotiation-mood-track"
            >
              <div
                className="negotiation-mood-fill"
                style={{
                  backgroundColor: negotiation.moodColor,
                  color: negotiation.moodColor,
                  width: `${negotiation.moodScore}%`,
                }}
              />
            </div>
          </article>
        </div>
        {latestOffer && (
          <div className="contract-offer-history-note">
            최근 제안: {getOfferStatusLabel(latestOffer.status)} ·{" "}
            {formatSalaryAmount(latestOffer.salaryOffer)} · 역할{" "}
            {getRequestedRosterRoleLabel(latestOffer.requestedRosterRole)}
            {latestOffer.moodScore !== undefined
              ? ` · 분위기 ${latestOffer.moodScore}%`
              : ""}
          </div>
        )}
        <div className="season-summary-actions">
          <Button
            onClick={() => {
              onSubmit({
                playerId: modalPlayer.id,
                contractType,
                requestedRosterRole,
                salaryOffer,
              });
              onClose();
            }}
          >
            제안 보내기
          </Button>
          <Button variant="ghost" onClick={onClose}>
            닫기
          </Button>
        </div>
      </section>
    </div>
  );
}
