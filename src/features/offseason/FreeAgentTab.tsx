import { useState } from "react";
import { isFreeAgentMarketPlayer } from "../../domain/season";
import { formatSalaryAmount } from "../../shared/format/money";
import { Button } from "../../shared/ui/Button";
import { EvaluationStars } from "../../shared/ui/EvaluationStars";
import { PlayerPortrait } from "../../shared/ui/PlayerPortrait";
import type { CareerSave, OffseasonOffer, Player, Role } from "../../types/game";
import {
  findLatestOffer,
  getActiveSalaryTotal,
  getConfirmationPendingOffers,
  getContractedRoleCount,
  getMarketTeamLabel,
  getOfferStatusLabel,
  getPlayer,
  getPlayerLabel,
  getRequestedRosterRoleLabel,
  getRosterTierLabel,
  getVisibleDemand,
  handleRowActivation,
  roleOptions,
  type NegotiationTarget,
} from "./offseasonMarketShared";

export function ConfirmationPendingSection({
  career,
  onCancelFreeAgentSigning,
  onConfirmFreeAgentSigning,
  onViewPlayer,
}: {
  career: CareerSave;
  onCancelFreeAgentSigning: (offerId: string) => void;
  onConfirmFreeAgentSigning: (offerId: string) => void;
  onViewPlayer: (player: Player) => void;
}) {
  const [notice, setNotice] = useState("");
  const pendingOffers = getConfirmationPendingOffers(career);

  if (pendingOffers.length === 0) {
    return null;
  }

  return (
    <div className="offseason-confirmation-section">
      <div className="section-label-row">
        <span>영입 확정 대기</span>
        <strong>{pendingOffers.length}</strong>
      </div>
      {notice && <p className="offseason-confirmation-notice">{notice}</p>}
      <div className="offseason-confirmation-grid">
        {pendingOffers.map((offer) => {
          const player = getPlayer(career.lckPlayers, offer.playerIds[0]);
          const activeSalaryTotal = getActiveSalaryTotal(career);
          const remainingBudget = career.userTeam.budget - activeSalaryTotal;
          const roleCount = player
            ? getContractedRoleCount(career, player.role)
            : 0;
          const budgetExceeded = offer.salaryOffer > remainingBudget;
          const roleLimitExceeded = roleCount >= 3;
          const canConfirm = Boolean(player) && !budgetExceeded && !roleLimitExceeded;
          const blockReason = budgetExceeded
            ? `예산 여유 ${formatSalaryAmount(
                remainingBudget,
              )}보다 제안 연봉이 높습니다.`
            : roleLimitExceeded && player
              ? `${player.role.toUpperCase()} 포지션은 이미 3명을 보유 중입니다.`
              : "";

          return (
            <article className="offseason-confirmation-card" key={offer.id}>
              <div
                className={
                  player
                    ? "offseason-confirmation-player-card offseason-confirmation-player-card-clickable"
                    : "offseason-confirmation-player-card"
                }
                onClick={
                  player ? () => onViewPlayer(player) : undefined
                }
                onKeyDown={
                  player
                    ? (event) =>
                        handleRowActivation(event, () => onViewPlayer(player))
                    : undefined
                }
                role={player ? "button" : undefined}
                tabIndex={player ? 0 : undefined}
              >
                {player ? (
                  <>
                    <PlayerPortrait player={player} size="lg" />
                    <em>{player.name}</em>
                    <EvaluationStars compact player={player} />
                  </>
                ) : (
                  <>
                    <span>FA</span>
                    <em>{offer.playerIds[0]}</em>
                  </>
                )}
              </div>
              <div className="offseason-confirmation-details">
                <strong>{player?.name ?? offer.playerIds[0]}</strong>
                <span>{player ? getPlayerLabel(player) : "선수 정보 없음"}</span>
                {player && <EvaluationStars compact player={player} />}
                <small>제안 연봉 {formatSalaryAmount(offer.salaryOffer)}</small>
                <small>
                  제안 역할 {getRequestedRosterRoleLabel(offer.requestedRosterRole)}
                </small>
                <small>
                  예산 여유 {formatSalaryAmount(remainingBudget)} · 포지션{" "}
                  {roleCount}/3
                </small>
                {!canConfirm && blockReason && (
                  <small className="offseason-confirm-block-reason">
                    확정 불가: {blockReason}
                  </small>
                )}
              </div>
              <div
                className="offseason-confirmation-actions"
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                {!canConfirm && blockReason && (
                  <small className="offseason-confirm-tooltip-copy">
                    {blockReason}
                  </small>
                )}
                <Button
                  aria-disabled={!canConfirm}
                  className={
                    canConfirm
                      ? "offseason-confirm-button"
                      : "offseason-confirm-button offseason-confirm-button-disabled"
                  }
                  onClick={() => {
                    if (!canConfirm) {
                      setNotice(
                        `${player?.name ?? "해당 선수"} 영입 불가: ${blockReason}`,
                      );
                      return;
                    }

                    setNotice("");
                    onConfirmFreeAgentSigning(offer.id);
                  }}
                  title={!canConfirm ? blockReason : undefined}
                  type="button"
                >
                  영입 확정
                </Button>
                <Button
                  className="offseason-cancel-button"
                  onClick={() => {
                    setNotice("");
                    onCancelFreeAgentSigning(offer.id);
                  }}
                  type="button"
                  variant="ghost"
                >
                  영입 취소
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function FreeAgentTab({
  career,
  onCancelFreeAgentSigning,
  onConfirmFreeAgentSigning,
  onOpenNegotiation,
  onViewPlayer,
}: {
  career: CareerSave;
  onCancelFreeAgentSigning: (offerId: string) => void;
  onConfirmFreeAgentSigning: (offerId: string) => void;
  onOpenNegotiation: (target: NegotiationTarget) => void;
  onViewPlayer: (player: Player) => void;
}) {
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [tierFilter, setTierFilter] = useState<
    "all" | "main" | "academy" | "free-agent"
  >("all");
  const offseason = career.seasonState.offseason;
  const currentDay = offseason?.currentDay ?? 1;
  const canOffer = currentDay >= 8 && currentDay < 28;
  const pendingPlayerIds = new Set(
    (offseason?.pendingOffers ?? [])
      .filter((offer) => offer.status === "pending")
      .flatMap((offer) => offer.playerIds),
  );
  const confirmationPendingOffers = getConfirmationPendingOffers(career);
  const freeAgents = career.lckPlayers
    .filter((player) => isFreeAgentMarketPlayer(career, player))
    .sort((left, right) => right.overall - left.overall);
  const normalizedQuery = query.trim().toLowerCase();
  const teamOptions = [
    ...new Set(
      freeAgents
        .map((player) => player.currentTeam)
        .filter((teamName): teamName is string => Boolean(teamName)),
    ),
  ].sort((left, right) => left.localeCompare(right));
  const filteredPlayers = freeAgents.filter((player) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      player.name.toLowerCase().includes(normalizedQuery) ||
      (player.realName ?? "").toLowerCase().includes(normalizedQuery) ||
      (player.nativeName ?? "").toLowerCase().includes(normalizedQuery);
    const matchesTeam =
      teamFilter === "all" || player.currentTeam === teamFilter;
    const matchesRole = roleFilter === "all" || player.role === roleFilter;
    const matchesTier =
      tierFilter === "all" || (player.rosterTier ?? "free-agent") === tierFilter;

    return matchesQuery && matchesTeam && matchesRole && matchesTier;
  });

  if (freeAgents.length === 0 && confirmationPendingOffers.length === 0) {
    return (
      <div className="offseason-empty">
        <strong>FA 시장에 남은 선수가 없습니다.</strong>
        <span>이적 로그와 최종 로스터를 확인하세요.</span>
      </div>
    );
  }

  return (
    <div className="offseason-list">
      <ConfirmationPendingSection
        career={career}
        onCancelFreeAgentSigning={onCancelFreeAgentSigning}
        onConfirmFreeAgentSigning={onConfirmFreeAgentSigning}
        onViewPlayer={onViewPlayer}
      />
      {freeAgents.length === 0 && (
        <div className="offseason-empty">
          <strong>FA 시장에 남은 선수가 없습니다.</strong>
          <span>확정 대기 중인 영입을 처리한 뒤 이적 로그를 확인하세요.</span>
        </div>
      )}
      <div className="offseason-filter-row">
        <label>
          <span>검색</span>
          <input
            aria-label="시장 선수 검색"
            placeholder="선수명"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label>
          <span>팀</span>
          <select
            aria-label="시장 팀 필터"
            value={teamFilter}
            onChange={(event) => setTeamFilter(event.target.value)}
          >
            <option value="all">전체 팀</option>
            {teamOptions.map((teamName) => (
              <option key={teamName} value={teamName}>
                {teamName}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>포지션</span>
          <select
            aria-label="시장 포지션 필터"
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value as "all" | Role)
            }
          >
            <option value="all">전체 포지션</option>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>구분</span>
          <select
            aria-label="시장 1군 2군 필터"
            value={tierFilter}
            onChange={(event) =>
              setTierFilter(
                event.target.value as "all" | "main" | "academy" | "free-agent",
              )
            }
          >
            <option value="all">전체</option>
            <option value="main">1군</option>
            <option value="academy">2군</option>
            <option value="free-agent">무소속</option>
          </select>
        </label>
        <strong>{filteredPlayers.length}명</strong>
      </div>
      {!canOffer && (
        <p className="muted">
          FA 제안은 2주차부터 4주차 27일차까지 가능합니다. 28일차에는 최종
          등록만 진행됩니다.
        </p>
      )}
      {filteredPlayers.length === 0 && (
        <div className="offseason-empty">
          <strong>필터에 맞는 선수가 없습니다.</strong>
          <span>검색어 또는 필터를 조정해 보세요.</span>
        </div>
      )}
      {filteredPlayers.map((player) => {
        const demand = getVisibleDemand({
          career,
          context: "free-agent",
          contractType: "one-year",
          player,
        });
        const isPending = pendingPlayerIds.has(player.id);
        const latestOffer = findLatestOffer(career, player.id, "free-agent");

        return (
          <article
            className="offseason-player-row offseason-player-row-clickable"
            key={player.id}
            onClick={() => onViewPlayer(player)}
            onKeyDown={(event) =>
              handleRowActivation(event, () => onViewPlayer(player))
            }
            role="button"
            tabIndex={0}
          >
            <div className="offseason-player-portrait-cell">
              <PlayerPortrait player={player} size="lg" />
            </div>
            <div className="offseason-player-main">
              <strong>{player.name}</strong>
              <span>{getPlayerLabel(player)}</span>
              <EvaluationStars compact player={player} />
            </div>
            <div className="offseason-player-market-info">
              <small>
                {latestOffer
                  ? `최근 FA 제안 ${getOfferStatusLabel(
                      latestOffer.status,
                    )} · ${formatSalaryAmount(
                      latestOffer.salaryOffer,
                    )} · ${getRequestedRosterRoleLabel(
                      latestOffer.requestedRosterRole,
                    )}`
                  : `선수 측 요구액 ${formatSalaryAmount(
                      demand,
                    )} · ${getMarketTeamLabel(player)} · ${getRosterTierLabel(
                      player,
                      )}`}
              </small>
            </div>
            <div
              className="offseason-offer-controls"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <Button
                disabled={!canOffer || isPending}
                onClick={() =>
                  onOpenNegotiation({
                    mode: "free-agent",
                    playerId: player.id,
                  })
                }
              >
                {isPending ? "제안 대기" : "FA 협상"}
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
