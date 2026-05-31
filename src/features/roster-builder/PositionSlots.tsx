import { Button } from "../../shared/ui/Button";
import type { Player, Role, Team } from "../../types/game";

const roles: Role[] = ["top", "jungle", "mid", "bot", "support"];

type PositionSlotsProps = {
  team: Team;
  players: Player[];
  onClearRole: (role: Role, player: Player | null) => void;
};

export function PositionSlots({ team, players, onClearRole }: PositionSlotsProps) {
  return (
    <div className="slot-grid">
      {roles.map((role) => {
        const player = players.find((candidate) => candidate.id === team.roster[role]);

        return (
          <div className="slot" key={role}>
            <span className="slot-role">{role}</span>
            <strong>{player?.name ?? "Open slot"}</strong>
            {player && (
              <Button variant="ghost" onClick={() => onClearRole(role, null)}>
                Clear
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
