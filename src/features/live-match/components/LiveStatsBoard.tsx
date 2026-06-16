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
      <b className="live-pop" key={`k${player.stats.kills}`}>
        {player.stats.kills}
      </b>
      /
      <b className="live-pop" key={`d${player.stats.deaths}`}>
        {player.stats.deaths}
      </b>
      /
      <b className="live-pop" key={`a${player.stats.assists}`}>
        {player.stats.assists}
      </b>
    </div>
  );
  const metrics = (
    <div className="live-player-metrics">
      <span>
        Lv{" "}
        <span className="live-pop" key={`lv${player.stats.level}`}>
          {player.stats.level}
        </span>
      </span>
      <span>{player.stats.gold}</span>
    </div>
  );
  const slots = player.stats.itemSlots;
  const bootsIndex = slots.findIndex((slot) => slot?.tags.includes("boots"));
  const boots = bootsIndex >= 0 ? slots[bootsIndex] : null;
  const itemSlots = slots.filter((_, index) => index !== bootsIndex).slice(0, 5);

  while (itemSlots.length < 5) {
    itemSlots.push(null);
  }

  const items = (
    <div className="live-item-slots" aria-label={`${player.name} items`}>
      {itemSlots.map((item, index) => (
        <span
          className={`live-item-slot ${item ? "" : "live-item-slot-empty"}`}
          key={`item-${item?.id ?? "empty"}-${index}`}
          title={item?.name}
        >
          {item ? <img alt="" src={item.iconUrl} /> : null}
        </span>
      ))}
      <span
        className={`live-item-slot live-item-slot-boots ${boots ? "" : "live-item-slot-empty"}`}
        title={boots ? `신발 · ${boots.name}` : "신발 슬롯"}
        aria-label="신발 슬롯"
      >
        {boots ? <img alt="" src={boots.iconUrl} /> : null}
      </span>
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
