import { findLckTeamSeed } from "../../../data/lckTeams";
import type {
  LiveMatchPresentation,
  LiveMatchSide,
  LiveMatchTeamPresentation,
} from "../../../domain/live-match";
import { TeamLogo } from "../../../shared/ui/TeamLogo";

type LiveMatchTopbarProps = {
  presentation: LiveMatchPresentation;
};

function TeamHeader({ side, team }: { side: LiveMatchSide; team: LiveMatchTeamPresentation }) {
  const seed = findLckTeamSeed(team.id) ?? findLckTeamSeed(team.name);

  return (
    <section className={`live-team-header live-team-header-${side}`}>
      <TeamLogo fallbackLabel={team.shortName} size="md" team={seed} teamId={team.id} />
      <div>
        <span>{side === "blue" ? "BLUE SIDE" : "RED SIDE"}</span>
        <strong>{team.name}</strong>
      </div>
    </section>
  );
}

export function LiveMatchTopbar({ presentation }: LiveMatchTopbarProps) {
  const { blueTeam, gameNumber, gameTime, redTeam, stageName } = presentation.currentSet;

  return (
    <header className="live-match-topbar">
      <TeamHeader side="blue" team={blueTeam} />
      <div className="live-scoreboard">
        <p className="eyebrow">Live match prototype</p>
        <div className="live-scoreline">
          <strong>{blueTeam.gold}</strong>
          <span>{blueTeam.kills}</span>
          <b>{gameTime}</b>
          <span>{redTeam.kills}</span>
          <strong>{redTeam.gold}</strong>
        </div>
        <div className="live-series-row">
          <span>{presentation.formatLabel}</span>
          <span>Game {gameNumber}</span>
          <span>{stageName}</span>
        </div>
      </div>
      <TeamHeader side="red" team={redTeam} />
    </header>
  );
}
