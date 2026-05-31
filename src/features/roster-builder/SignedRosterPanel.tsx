import { Button } from "../../shared/ui/Button";
import type { ContractType, Player, Team } from "../../types/game";

type SignedRosterPanelProps = {
  players: Player[];
  selectedPlayerIds: string[];
  team: Team;
  contractTypes: Record<string, ContractType>;
  onContractTypeChange: (playerId: string, type: ContractType) => void;
  onReleasePlayer: (playerId: string) => void;
};

const contractOptions: Array<{ value: ContractType; label: string }> = [
  { value: "one-year", label: "1 year" },
  { value: "two-year", label: "2 years" },
  { value: "one-plus-one", label: "1+1 year" },
];

export function SignedRosterPanel({
  players,
  selectedPlayerIds,
  team,
  contractTypes,
  onContractTypeChange,
  onReleasePlayer,
}: SignedRosterPanelProps) {
  const starterIds = new Set(Object.values(team.roster));
  const selectedPlayers = selectedPlayerIds
    .map((playerId) => players.find((player) => player.id === playerId))
    .filter((player): player is Player => Boolean(player));

  return (
    <div className="signed-roster">
      <h3>Signed players</h3>
      {selectedPlayers.length === 0 && (
        <p className="muted">No players signed yet.</p>
      )}
      {selectedPlayers.map((player) => (
        <div className="signed-player-row" key={player.id}>
          <div>
            <strong>{player.name}</strong>
            <p className="muted">
              {player.role} · {player.currentTeam} · salary {player.salaryExpectation}
              {starterIds.has(player.id) ? " · starter" : " · academy"}
            </p>
          </div>
          <label className="contract-select">
            Contract
            <select
              value={contractTypes[player.id] ?? "one-year"}
              onChange={(event) =>
                onContractTypeChange(player.id, event.target.value as ContractType)
              }
            >
              {contractOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <Button variant="ghost" onClick={() => onReleasePlayer(player.id)}>
            Release
          </Button>
        </div>
      ))}
    </div>
  );
}
