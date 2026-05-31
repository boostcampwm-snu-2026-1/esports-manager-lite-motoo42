import { Card } from "../../shared/ui/Card";
import { StatPill } from "../../shared/ui/StatPill";
import type { Player, Role } from "../../types/game";

type PlayerMarketProps = {
  players: Player[];
  selectedRoster: Partial<Record<Role, string>>;
  signedPlayerIds: string[];
  onSignPlayer: (player: Player) => void;
  onSelectStarter: (role: Role, player: Player) => void;
};

export function PlayerMarket({
  players,
  selectedRoster,
  signedPlayerIds,
  onSignPlayer,
  onSelectStarter,
}: PlayerMarketProps) {
  const starterIds = new Set(Object.values(selectedRoster));
  const signedIds = new Set(signedPlayerIds);

  return (
    <Card>
      <h2>LCK player pool</h2>
      <div className="player-list">
        {players.map((player) => {
          const isSigned = signedIds.has(player.id);
          const isStarter = starterIds.has(player.id);

          return (
            <article className="player-card" key={player.id}>
              <span className="player-card-header">
                <strong>{player.name}</strong>
                <span>{player.role}</span>
              </span>
              <span className="muted">{player.currentTeam}</span>
              <span className="pill-row">
                <StatPill label="OVR" value={player.overall} />
                <StatPill label="POT" value={player.potential} />
                <StatPill label="Salary" value={player.salaryExpectation} />
              </span>
              <span className="player-card-actions">
                <button
                  className="button button-ghost"
                  disabled={isSigned}
                  onClick={() => onSignPlayer(player)}
                  type="button"
                >
                  {isSigned ? "Signed" : "Sign"}
                </button>
                <button
                  className="button button-primary"
                  disabled={!isSigned || isStarter}
                  onClick={() => onSelectStarter(player.role, player)}
                  type="button"
                >
                  {isStarter ? "Starter" : "Start"}
                </button>
              </span>
            </article>
          );
        })}
      </div>
    </Card>
  );
}
