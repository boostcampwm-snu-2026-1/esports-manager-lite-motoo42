import { useState } from "react";
import { Card } from "../../shared/ui/Card";
import { EvaluationStars } from "../../shared/ui/EvaluationStars";
import { PlayerPortrait } from "../../shared/ui/PlayerPortrait";
import type { CareerSave, Player, Role } from "../../types/game";
import {
  getMarketTeamLabel,
  getPlayerLabel,
  getRosterTierLabel,
  handleRowActivation,
  roleOptions,
} from "./offseasonMarketShared";

// Stove-league "선수 명부" sub-page: the full player directory — signed players
// AND free agents — with each player's team affiliation, in the same row format
// as the FA list. Lists career.lckPlayers directly so every row resolves for the
// detail modal.
export function OffseasonAllPlayersPanel({
  career,
  onViewPlayer,
}: {
  career: CareerSave;
  onViewPlayer: (player: Player) => void;
}) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [tierFilter, setTierFilter] = useState<
    "all" | "main" | "academy" | "free-agent"
  >("all");

  const normalizedQuery = query.trim().toLowerCase();
  const players = [...career.lckPlayers].sort((left, right) => {
    const overallDiff = right.overall - left.overall;

    return overallDiff !== 0 ? overallDiff : left.id.localeCompare(right.id);
  });
  const filteredPlayers = players.filter((player) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      player.name.toLowerCase().includes(normalizedQuery) ||
      (player.realName ?? "").toLowerCase().includes(normalizedQuery) ||
      (player.nativeName ?? "").toLowerCase().includes(normalizedQuery);
    const matchesRole = roleFilter === "all" || player.role === roleFilter;
    const matchesTier =
      tierFilter === "all" || (player.rosterTier ?? "free-agent") === tierFilter;

    return matchesQuery && matchesRole && matchesTier;
  });

  return (
    <Card>
      <div className="section-label-row">
        <span>선수 명부</span>
        <strong>{filteredPlayers.length}명</strong>
      </div>
      <p className="muted">
        계약 선수와 FA를 포함한 전체 선수 명단입니다. 소속과 평가를 한눈에
        확인하고, 선수를 눌러 세부 능력치를 볼 수 있습니다.
      </p>
      <div className="offseason-filter-row">
        <label>
          <span>검색</span>
          <input
            aria-label="전체 선수 검색"
            placeholder="선수명"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label>
          <span>포지션</span>
          <select
            aria-label="전체 선수 포지션 필터"
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
            aria-label="전체 선수 1군 2군 필터"
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
      </div>
      {filteredPlayers.length === 0 ? (
        <div className="offseason-empty">
          <strong>조건에 맞는 선수가 없습니다.</strong>
          <span>검색어나 필터를 조정하세요.</span>
        </div>
      ) : (
        <div className="offseason-list offseason-closed-player-list">
          {filteredPlayers.slice(0, 100).map((player) => (
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
                  {getMarketTeamLabel(player)} · {getRosterTierLabel(player)}
                </small>
              </div>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}
