import { getUnresolvedExpiredPlayerIds } from "../../domain/season";
import { formatSalaryAmount } from "../../shared/format/money";
import { Button } from "../../shared/ui/Button";
import { EvaluationStars } from "../../shared/ui/EvaluationStars";
import { PlayerPortrait } from "../../shared/ui/PlayerPortrait";
import type { CareerSave, Player } from "../../types/game";
import {
  findLatestOffer,
  getOfferStatusLabel,
  getPlayer,
  getPlayerLabel,
  getRequestedRosterRoleLabel,
  getVisibleDemand,
  handleRowActivation,
  type NegotiationTarget,
} from "./offseasonMarketShared";

export function ContractTab({
  career,
  onOpenNegotiation,
  onReleaseExpiredPlayer,
  onViewPlayer,
}: {
  career: CareerSave;
  onOpenNegotiation: (target: NegotiationTarget) => void;
  onReleaseExpiredPlayer: (playerId: string) => void;
  onViewPlayer: (player: Player) => void;
}) {
  const offseason = career.seasonState.offseason;
  const unresolvedIds = new Set(getUnresolvedExpiredPlayerIds(career));
  const expiredPlayers = (offseason?.expiredContractPlayerIds ?? [])
    .map((playerId) => getPlayer(career.lckPlayers, playerId))
    .filter((player): player is Player => Boolean(player));

  if (expiredPlayers.length === 0) {
    return (
      <div className="offseason-empty">
        <strong>계약 만료 선수가 없습니다.</strong>
        <span>2주차부터 FA 시장에 집중하면 됩니다.</span>
      </div>
    );
  }

  return (
    <div className="offseason-list">
      {expiredPlayers.map((player) => {
        const resolved = !unresolvedIds.has(player.id);
        const latestOffer = findLatestOffer(career, player.id, "renewal");
        const isPending = latestOffer?.status === "pending";

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
                  ? `최근 재계약 제안 ${getOfferStatusLabel(
                      latestOffer.status,
                    )} · ${formatSalaryAmount(
                      latestOffer.salaryOffer,
                    )} · ${getRequestedRosterRoleLabel(
                      latestOffer.requestedRosterRole,
                    )}`
                  : `선수 측 요구액 ${formatSalaryAmount(
                      getVisibleDemand({
                        career,
                        context: "renewal",
                        contractType: "one-year",
                        player,
                      }),
                    )}`}
              </small>
            </div>
            {resolved ? (
              <strong className="offseason-status-label">처리 완료</strong>
            ) : (
              <div
                className="offseason-offer-controls"
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <Button
                  disabled={isPending}
                  onClick={() =>
                    onOpenNegotiation({
                      mode: "renewal",
                      playerId: player.id,
                    })
                  }
                >
                  {isPending ? "제안 대기" : "재계약 협상"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => onReleaseExpiredPlayer(player.id)}
                >
                  방출
                </Button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
