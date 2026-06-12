import { useState } from "react";
import type { OffseasonSubPage } from "../../app/routes";
import { validateOffseasonRoster } from "../../domain/season";
import { formatSalaryAmount } from "../../shared/format/money";
import { Card } from "../../shared/ui/Card";
import { EvaluationStars } from "../../shared/ui/EvaluationStars";
import { PlayerDetailModal } from "../../shared/ui/PlayerDetailModal";
import { PlayerPortrait } from "../../shared/ui/PlayerPortrait";
import type { CareerSave, Player, Role } from "../../types/game";
import { OffseasonLogTeamSelect } from "./LogTab";
import {
  getActiveSalaryTotal,
  getClosedMarketPlayers,
  getClosedMarketStatusLabel,
  getMarketTeamLabel,
  getNextMarketDescription,
  getPlayer,
  getPlayerLabel,
  getRecentOffseasonLogs,
  getRosterTierLabel,
  handleRowActivation,
  logMatchesTeamFilter,
  OffseasonPlayerMarketDetails,
  roleOptions,
  type OffseasonLogTeamFilter,
} from "./offseasonMarketShared";

function ClosedMarketFreeAgentPanel({
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
  const players = getClosedMarketPlayers(career);
  const normalizedQuery = query.trim().toLowerCase();
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
        <span>FA 명단</span>
        <strong>{filteredPlayers.length}명</strong>
      </div>
      <p className="muted">
        협상은 등록된 이적시장 기간에만 가능합니다. 지금은 시장 상태와
        후보군만 확인할 수 있습니다.
      </p>
      <div className="offseason-filter-row">
        <label>
          <span>검색</span>
          <input
            aria-label="닫힌 시장 선수 검색"
            placeholder="선수명"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label>
          <span>포지션</span>
          <select
            aria-label="닫힌 시장 포지션 필터"
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
            aria-label="닫힌 시장 1군 2군 필터"
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
          <strong>확인 가능한 FA 선수가 없습니다.</strong>
          <span>필터를 조정하거나 다음 이적시장 개장을 기다리세요.</span>
        </div>
      ) : (
        <div className="offseason-list offseason-closed-player-list">
          {filteredPlayers.slice(0, 16).map((player) => (
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
                <small>협상 가능 기간에 제안할 수 있습니다.</small>
              </div>
              <strong className="offseason-status-label">관찰 가능</strong>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}

function ClosedMarketLogPanel({ career }: { career: CareerSave }) {
  const [teamFilter, setTeamFilter] =
    useState<OffseasonLogTeamFilter>("all");
  const logs = getRecentOffseasonLogs(career);
  const filteredLogs = logs.filter((log) =>
    logMatchesTeamFilter({ career, log, teamFilter }),
  );

  return (
    <Card>
      <div className="section-label-row">
        <span>이적 로그</span>
        <strong>{filteredLogs.length}</strong>
      </div>
      {logs.length === 0 ? (
        <div className="offseason-empty">
          <strong>아직 확인할 이적 로그가 없습니다.</strong>
          <span>스토브리그가 진행되면 주요 기록이 이곳에 남습니다.</span>
        </div>
      ) : (
        <div className="offseason-log-panel">
          <OffseasonLogTeamSelect
            filteredCount={filteredLogs.length}
            onChange={setTeamFilter}
            totalCount={logs.length}
            value={teamFilter}
          />
          {filteredLogs.length === 0 ? (
            <div className="offseason-empty">
              <strong>선택한 팀의 이적 로그가 없습니다.</strong>
              <span>다른 팀을 선택하거나 전체 팀으로 돌아가세요.</span>
            </div>
          ) : (
            <div className="offseason-log-list offseason-closed-log-list">
              {filteredLogs.map((log) => (
                <article
                  className={`offseason-log-entry offseason-log-${log.type} ${
                    log.isUserTeamRelated ? "offseason-log-user-team" : ""
                  }`}
                  key={log.id}
                >
                  <span>
                    {log.week}주차 {log.day}일
                  </span>
                  <strong>{log.message}</strong>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function ClosedMarketOverviewPanel({ career }: { career: CareerSave }) {
  const validation = validateOffseasonRoster(career, {
    academyPolicy: "auto-fill",
  });
  const activeSalaryTotal = getActiveSalaryTotal(career);
  const remainingBudget = career.userTeam.budget - activeSalaryTotal;

  return (
    <>
      <Card>
        <div className="offseason-closed-hero">
          <div>
            <p className="eyebrow">Stove League Hub</p>
            <h1>현재 이적시장은 닫혀 있습니다.</h1>
            <p>{getNextMarketDescription(career)}</p>
          </div>
          <div className="offseason-day-badge">
            <span>현재 상태</span>
            <strong>{getClosedMarketStatusLabel(career)}</strong>
          </div>
        </div>
      </Card>

      <Card>
        <div className="section-label-row">
          <span>시장 개요</span>
          <strong>{career.seasonState.currentDateLabel}</strong>
        </div>
        <div className="season-summary-metrics">
          <article className="season-summary-metric">
            <span>총 예산</span>
            <strong>{formatSalaryAmount(career.userTeam.budget)}</strong>
            <small>현재 시즌 기준</small>
          </article>
          <article className="season-summary-metric">
            <span>연봉 총액</span>
            <strong>{formatSalaryAmount(activeSalaryTotal)}</strong>
            <small>잔여 {formatSalaryAmount(remainingBudget)}</small>
          </article>
          <article
            className={`season-summary-metric budget-metric-${
              remainingBudget < 0 ? "danger" : "good"
            }`}
          >
            <span>예산 상태</span>
            <strong>{remainingBudget < 0 ? "초과" : "정상"}</strong>
            <small>{formatSalaryAmount(remainingBudget)}</small>
          </article>
          <article className="season-summary-metric">
            <span>1군 등록</span>
            <strong>{validation.mainRosterPlayerIds.length}명</strong>
            <small>선발 5인 + 후보</small>
          </article>
          <article className="season-summary-metric">
            <span>2군 등록</span>
            <strong>{validation.academyPlayerIds.length}명</strong>
            <small>아카데미 로스터</small>
          </article>
        </div>
      </Card>
    </>
  );
}

function ClosedMarketSchedulePanel() {
  return (
      <Card>
        <div className="section-label-row">
          <span>일정 안내</span>
          <strong>후속 확장 여지</strong>
        </div>
        <div className="offseason-window-grid">
          <article className="offseason-mini-player">
            <strong>정규 스토브리그</strong>
            <span>프리시즌과 시즌 종료 후 28일 시장</span>
          </article>
          <article className="offseason-mini-player">
            <strong>MSI 전후 단기 시장</strong>
            <span>
              LCK Rounds 1-2 종료 후 추가 영입, 방출, 트레이드 확장 예정
            </span>
          </article>
        </div>
      </Card>
  );
}

export function ClosedOffseasonInfo({
  career,
  subPage,
}: {
  career: CareerSave;
  subPage?: OffseasonSubPage | null;
}) {
  const activeSubPage = subPage ?? "overview";
  const [detailPlayerId, setDetailPlayerId] = useState<string | null>(null);
  const detailPlayer = detailPlayerId
    ? getPlayer(career.lckPlayers, detailPlayerId)
    : undefined;

  return (
    <section className="stack offseason-page">
      {activeSubPage === "overview" && <ClosedMarketOverviewPanel career={career} />}
      {activeSubPage === "free-agents" && (
        <ClosedMarketFreeAgentPanel
          career={career}
          onViewPlayer={(player) => setDetailPlayerId(player.id)}
        />
      )}
      {activeSubPage === "schedule" && <ClosedMarketSchedulePanel />}
      {activeSubPage === "log" && <ClosedMarketLogPanel career={career} />}
      {detailPlayer && (
        <PlayerDetailModal
          extraContent={<OffseasonPlayerMarketDetails player={detailPlayer} />}
          onClose={() => setDetailPlayerId(null)}
          player={detailPlayer}
          rosterLabel={getRosterTierLabel(detailPlayer)}
          titlePrefix="Stove League Profile"
        />
      )}
    </section>
  );
}

