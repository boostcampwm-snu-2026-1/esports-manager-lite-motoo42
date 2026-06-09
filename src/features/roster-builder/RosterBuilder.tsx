import { useEffect, useMemo, useState } from "react";
import {
  getSelectedRosterPlayerIds,
  validateFullRoster,
  type ContractTypeSelections,
} from "../../domain/roster";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import type { Player, Role, Team } from "../../types/game";
import { BudgetSummary } from "./BudgetSummary";
import { PlayerMarket } from "./PlayerMarket";
import { PositionSlots } from "./PositionSlots";
import { SignedRosterPanel } from "./SignedRosterPanel";

type RosterBuilderProps = {
  players: Player[];
  team: Team;
  onSelectPlayer: (role: Role, player: Player | null) => void;
  onSignPlayer: (player: Player) => void;
  onReleasePlayer: (playerId: string) => void;
  onConfirmRoster: (contractTypes: ContractTypeSelections) => void;
};

export function RosterBuilder({
  players,
  team,
  onSelectPlayer,
  onSignPlayer,
  onReleasePlayer,
  onConfirmRoster,
}: RosterBuilderProps) {
  const selectedPlayerIds = useMemo(() => getSelectedRosterPlayerIds(team), [team]);
  const [contractTypes, setContractTypes] = useState<ContractTypeSelections>({});

  useEffect(() => {
    setContractTypes((current) => {
      const next: ContractTypeSelections = {};

      selectedPlayerIds.forEach((playerId) => {
        next[playerId] = current[playerId] ?? "one-year";
      });

      return next;
    });
  }, [selectedPlayerIds]);

  const validation = validateFullRoster({
    team,
    players,
    contractTypes,
  });
  const selectedCount = selectedPlayerIds.length;

  return (
    <section className="stack">
      <header>
        <p className="eyebrow">Stove League</p>
        <h1>{team.name} roster contracts</h1>
        <p className="lede">
          Sign 10-15 LCK players, pick five starters, and confirm contract terms.
        </p>
      </header>

      <div className="two-column">
        <Card>
          <BudgetSummary budget={team.budget} spent={validation.yearlySalary} />
          <p className="muted">
            Signed roster: {selectedCount} / {team.rosterSettings.minPlayers}-
            {team.rosterSettings.maxPlayers}
          </p>
          <PositionSlots team={team} players={players} onClearRole={onSelectPlayer} />
          <SignedRosterPanel
            players={players}
            selectedPlayerIds={selectedPlayerIds}
            team={team}
            contractTypes={contractTypes}
            onContractTypeChange={(playerId, type) =>
              setContractTypes((current) => ({
                ...current,
                [playerId]: type,
              }))
            }
            onReleasePlayer={onReleasePlayer}
          />
          {!validation.isValid && (
            <ul className="error-list">
              {validation.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
          <Button
            disabled={!validation.isValid}
            onClick={() => onConfirmRoster(contractTypes)}
          >
            Confirm roster and contracts
          </Button>
        </Card>

        <PlayerMarket
          players={players}
          selectedRoster={team.roster}
          signedPlayerIds={selectedPlayerIds}
          onSignPlayer={onSignPlayer}
          onSelectStarter={onSelectPlayer}
        />
      </div>
    </section>
  );
}
