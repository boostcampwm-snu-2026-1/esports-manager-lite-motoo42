import { liveMatchRoleLabels } from "../../../domain/live-match";
import type {
  LiveMatchPlayerPresentation,
  LiveMatchSetPresentation,
} from "../../../domain/live-match";
import { LiveChampionMark } from "./LiveChampionMark";

type LiveStatsBoardProps = {
  set: LiveMatchSetPresentation;
};

function PlayerStatRow({
  mirrored = false,
  player,
}: {
  mirrored?: boolean;
  player: LiveMatchPlayerPresentation;
}) {
  const core = (
    <div className="live-player-core">
      <LiveChampionMark
        iconUrl={player.champion.iconUrl}
        name={player.champion.name}
      />
      <div>
        <span>
          {liveMatchRoleLabels[player.role]} · {player.champion.name}
        </span>
        <strong>{player.name}</strong>
      </div>
    </div>
  );
  const kda = (
    <div className="live-player-kda">
      <b>{player.stats.kills}</b>/<b>{player.stats.deaths}</b>/<b>{player.stats.assists}</b>
    </div>
  );
  const metrics = (
    <div className="live-player-metrics">
      <span>Lv {player.stats.level}</span>
      <span>{player.stats.gold}</span>
    </div>
  );
  const items = (
    <div className="live-item-slots" aria-label={`${player.name} items`}>
      {player.stats.itemSlots.map((item, index) => (
        <span
          className={`live-item-slot ${item ? "" : "live-item-slot-empty"}`}
          key={`${item?.id ?? "empty"}-${index}`}
          title={item?.name}
        >
          {item ? <img alt="" src={item.iconUrl} /> : null}
        </span>
      ))}
    </div>
  );

  return (
    <article className={`live-player-row ${mirrored ? "live-player-row-red" : ""}`}>
      {mirrored ? (
        <>
          {items}
          {kda}
          {metrics}
          {core}
        </>
      ) : (
        <>
          {core}
          {kda}
          {metrics}
          {items}
        </>
      )}
    </article>
  );
}

export function LiveStatsBoard({ set }: LiveStatsBoardProps) {
  return (
    <footer className="live-stats-board" aria-label="선수 스탯 패널">
      <div className="live-stats-team live-stats-team-blue">
        {set.blueTeam.players.map((player) => (
          <PlayerStatRow key={player.role} player={player} />
        ))}
      </div>
      <div className="live-stats-center">
        <span>K / D / A</span>
        <strong>PLAYER STATS</strong>
        <span>LV · GOLD · ITEMS</span>
      </div>
      <div className="live-stats-team live-stats-team-red">
        {set.redTeam.players.map((player) => (
          <PlayerStatRow mirrored key={player.role} player={player} />
        ))}
      </div>
    </footer>
  );
}
