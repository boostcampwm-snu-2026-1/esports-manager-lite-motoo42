import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import type { Player, Role, SeasonProgressStatus, Team } from "../../types/game";
import { getMoraleLabel } from "../../domain/player-status";
import {
  formatSeasonDateLabel,
  isLineupEditableDate,
} from "../../domain/season/seasonScheduleDates";
import { MoraleIndicator } from "../../shared/ui/MoraleIndicator";

type SeasonRosterManagerProps = {
  players: Player[];
  team: Team;
  currentDateKey: string;
  progressStatus: SeasonProgressStatus;
  onSetStarter: (role: Role, player: Player) => void;
};

const roleOrder: Role[] = ["top", "jungle", "mid", "bot", "support"];
const roleLabels: Record<Role, string> = {
  top: "탑",
  jungle: "정글",
  mid: "미드",
  bot: "원딜",
  support: "서폿",
};

function getContractedPlayers(team: Team, players: Player[]) {
  const contractedIds = new Set(team.contracts.map((contract) => contract.playerId));

  return players.filter((player) => contractedIds.has(player.id));
}

function sortRosterPlayers(left: Player, right: Player) {
  const roleDiff = roleOrder.indexOf(left.role) - roleOrder.indexOf(right.role);

  if (roleDiff !== 0) {
    return roleDiff;
  }

  return right.overall - left.overall;
}

function getProgressHint(progressStatus: SeasonProgressStatus, currentDateKey: string) {
  if (!isLineupEditableDate(currentDateKey)) {
    return `${formatSeasonDateLabel(currentDateKey)}은 선발 변경 잠금일입니다. 선발 교체는 월요일과 화요일에만 가능합니다.`;
  }

  if (progressStatus === "match-preview") {
    return "경기 주간 준비일입니다. 선발 변경은 다음 우리 팀 경기부터 반영됩니다.";
  }

  if (progressStatus === "match-review") {
    return "경기 리뷰 상태입니다. 선발 변경은 다음 경기부터 반영됩니다.";
  }

  return "선발 변경 가능일입니다. 후보 카드를 선발 슬롯으로 드롭하면 즉시 반영됩니다.";
}

function PlayerDetailModal({
  player,
  onClose,
}: {
  player: Player;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="player-detail-modal" role="dialog" aria-modal="true">
        <button
          aria-label="상세 닫기"
          className="modal-close-button"
          onClick={onClose}
          type="button"
        >
          X
        </button>
        <div>
          <p className="eyebrow">{roleLabels[player.role]} 상세</p>
          <h2>{player.name}</h2>
          <p className="muted">
            {player.currentTeam} · OVR {player.overall} · POT {player.potential}
          </p>
        </div>
        <div className="player-detail-grid">
          <Stat label="피지컬" value={player.mechanics} />
          <Stat label="운영" value={player.macro} />
          <Stat label="라인전" value={player.laning} />
          <Stat label="한타" value={player.teamfight} />
          <Stat label="멘탈" value={player.mental} />
          <Stat label="챔프폭" value={player.championPool} />
          <Stat label="폼" value={player.status.form} />
          <Stat label="피로도" value={player.status.fatigue} />
          <div className="player-detail-stat player-detail-morale-stat">
            <span>사기</span>
            <strong>
              <MoraleIndicator level={player.status.morale} showLabel />
            </strong>
          </div>
          <Stat label="큰 경기" value={player.mindset.clutch} />
          <Stat label="적응력" value={player.adaptability.metaAdaptability} />
          <Stat label="소통" value={player.mindset.communication} />
        </div>
        <div>
          <p className="eyebrow">Traits</p>
          <div className="trait-row">
            {player.traits.map((trait) => (
              <span key={trait}>{trait}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="player-detail-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StarterSlot({
  player,
  role,
  onViewDetail,
}: {
  player: Player | undefined;
  role: Role;
  onViewDetail: (player: Player) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `starter-slot-${role}`,
    data: { role },
  });

  return (
    <article
      className={`lineup-slot ${isOver ? "lineup-slot-over" : ""}`}
      ref={setNodeRef}
    >
      <div className="lineup-slot-header">
        <strong>{roleLabels[role]}</strong>
        <span>선발 슬롯</span>
      </div>
      {player ? (
        <RosterPlayerCard
          compact
          onViewDetail={onViewDetail}
          player={player}
        />
      ) : (
        <div className="lineup-empty-slot">선발 없음</div>
      )}
    </article>
  );
}

function RosterPlayerCard({
  compact = false,
  draggable = false,
  overlay = false,
  onViewDetail,
  player,
}: {
  compact?: boolean;
  draggable?: boolean;
  overlay?: boolean;
  onViewDetail: (player: Player) => void;
  player: Player;
}) {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useDraggable({
    id: `player-${player.id}`,
    data: { playerId: player.id, role: player.role },
    disabled: !draggable || overlay,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <article
      className={`roster-management-card ${
        compact ? "roster-management-card-compact" : ""
      } ${overlay ? "roster-management-card-overlay" : ""} ${
        draggable ? "roster-management-card-draggable" : "roster-management-card-static"
      } ${
        isDragging ? "roster-management-card-dragging" : ""
      }`}
      onClick={() => {
        if (!overlay) {
          onViewDetail(player);
        }
      }}
      ref={setNodeRef}
      style={style}
      {...(draggable ? attributes : {})}
      {...(draggable ? listeners : {})}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onViewDetail(player);
        }
      }}
    >
      <div className="roster-management-card-main">
        <strong>{player.name}</strong>
        <span>{roleLabels[player.role]}</span>
      </div>
      <div className="roster-management-card-meta">
        <span>OVR {player.overall}</span>
      </div>
      <div className="roster-management-card-status-strip">
        <span>폼 {player.status.form}</span>
        <span>피로 {player.status.fatigue}</span>
        <span className="card-morale-cell">
          <MoraleIndicator level={player.status.morale} />
          {getMoraleLabel(player.status.morale)}
        </span>
      </div>
    </article>
  );
}

export function SeasonRosterManager({
  currentDateKey,
  players,
  progressStatus,
  team,
  onSetStarter,
}: SeasonRosterManagerProps) {
  const canEditLineup = isLineupEditableDate(currentDateKey);
  const [message, setMessage] = useState(
    getProgressHint(progressStatus, currentDateKey),
  );
  const [detailPlayer, setDetailPlayer] = useState<Player | null>(null);
  const [activeDragPlayerId, setActiveDragPlayerId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );
  const contractedPlayers = useMemo(
    () => getContractedPlayers(team, players).sort(sortRosterPlayers),
    [players, team],
  );
  const playerById = useMemo(
    () => new Map(contractedPlayers.map((player) => [player.id, player])),
    [contractedPlayers],
  );
  const starterIds = useMemo(
    () => new Set(Object.values(team.roster).filter(Boolean)),
    [team.roster],
  );
  const benchPlayers = useMemo(
    () => contractedPlayers.filter((player) => !starterIds.has(player.id)),
    [contractedPlayers, starterIds],
  );
  const activeDragPlayer = activeDragPlayerId
    ? playerById.get(activeDragPlayerId)
    : undefined;

  useEffect(() => {
    setMessage(getProgressHint(progressStatus, currentDateKey));
  }, [currentDateKey, progressStatus]);

  function handleDragStart(event: DragStartEvent) {
    if (!canEditLineup) {
      setMessage(
        `${formatSeasonDateLabel(currentDateKey)}에는 선발을 바꿀 수 없습니다. 월/화에 조정해 주세요.`,
      );
      return;
    }

    const playerId = event.active.data.current?.playerId as string | undefined;

    setActiveDragPlayerId(playerId ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragPlayerId(null);

    const playerId = event.active.data.current?.playerId as string | undefined;
    const playerRole = event.active.data.current?.role as Role | undefined;
    const targetRole = event.over?.data.current?.role as Role | undefined;

    if (!canEditLineup) {
      setMessage(
        `${formatSeasonDateLabel(currentDateKey)}에는 선발을 바꿀 수 없습니다. 월/화에 조정해 주세요.`,
      );
      return;
    }

    if (!playerId || !playerRole || !targetRole) {
      return;
    }

    const player = playerById.get(playerId);

    if (!player) {
      return;
    }

    if (playerRole !== targetRole) {
      setMessage(
        `${player.name}은 ${roleLabels[playerRole]} 포지션입니다. 1차 구현에서는 같은 포지션 슬롯에만 배치할 수 있습니다.`,
      );
      return;
    }

    if (team.roster[targetRole] === player.id) {
      setMessage(`${player.name}은 이미 ${roleLabels[targetRole]} 선발입니다.`);
      return;
    }

    onSetStarter(targetRole, player);
    setMessage(
      `${player.name}을 ${roleLabels[targetRole]} 선발로 등록했습니다. 기존 선발은 후보로 이동합니다.`,
    );
  }

  return (
    <section className="season-roster-manager">
      <header className="roster-management-header">
        <div>
          <p className="eyebrow">Roster management</p>
          <h1>선발 5인 관리</h1>
          <p className="lede">
            후보 카드를 같은 포지션 선발 슬롯으로 드래그하면 라인업이 즉시 변경됩니다.
          </p>
        </div>
        <div className="roster-management-status">
          <strong>{contractedPlayers.length}명 계약</strong>
          <span>{message}</span>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        onDragCancel={() => setActiveDragPlayerId(null)}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <section className="lineup-board">
          {roleOrder.map((role) => (
            <StarterSlot
              key={role}
              onViewDetail={setDetailPlayer}
              player={
                team.roster[role] ? playerById.get(team.roster[role] ?? "") : undefined
              }
              role={role}
            />
          ))}
        </section>

        <section className="bench-board">
          <div className="panel-title-row">
            <div>
              <p className="eyebrow">Roster</p>
              <h2>후보 선수 목록</h2>
            </div>
            <span className="panel-note">탑 · 정글 · 미드 · 원딜 · 서폿 순</span>
          </div>
          <div className="bench-player-grid">
            {benchPlayers.map((player) => (
              <RosterPlayerCard
                draggable={canEditLineup}
                key={player.id}
                onViewDetail={setDetailPlayer}
                player={player}
              />
            ))}
          </div>
        </section>
        <DragOverlay className="roster-drag-overlay" dropAnimation={null}>
          {activeDragPlayer ? (
            <RosterPlayerCard
              draggable={false}
              onViewDetail={setDetailPlayer}
              overlay
              player={activeDragPlayer}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {detailPlayer && (
        <PlayerDetailModal
          player={detailPlayer}
          onClose={() => setDetailPlayer(null)}
        />
      )}
    </section>
  );
}
