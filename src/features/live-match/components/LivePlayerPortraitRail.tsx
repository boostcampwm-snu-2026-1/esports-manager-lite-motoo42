import { liveMatchRoleLabels } from "../../../domain/live-match";
import type {
  LiveMatchPlayerPresentation,
  LiveMatchSide,
  LiveMatchTeamPresentation,
} from "../../../domain/live-match";
import { LiveChampionMark } from "./LiveChampionMark";

type LivePlayerPortraitRailProps = {
  compact?: boolean;
  side: LiveMatchSide;
  team: LiveMatchTeamPresentation;
};

function PlayerPortrait({ player }: { player: LiveMatchPlayerPresentation }) {
  if (player.portraitUrl) {
    return <img alt={`${player.name} 선수 사진`} src={player.portraitUrl} />;
  }

  return <LiveChampionMark name={player.name} />;
}

export function LivePlayerPortraitRail({
  compact = false,
  side,
  team,
}: LivePlayerPortraitRailProps) {
  return (
    <aside
      className={`live-player-portrait-rail live-player-portrait-rail-${side} ${
        compact ? "live-player-portrait-rail-compact" : ""
      }`}
      aria-label={`${team.name} 선수 사진`}
    >
      {team.players.map((player) => (
        <article className="live-player-portrait-card" key={player.role}>
          <div className="live-portrait-frame">
            <PlayerPortrait player={player} />
          </div>
          <div>
            <span>{liveMatchRoleLabels[player.role]}</span>
            <strong>{player.name}</strong>
          </div>
        </article>
      ))}
    </aside>
  );
}
