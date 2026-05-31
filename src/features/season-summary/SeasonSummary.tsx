import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import type { Team } from "../../types/game";

type SeasonSummaryProps = {
  team: Team;
  onBackToRoster: () => void;
};

export function SeasonSummary({ team, onBackToRoster }: SeasonSummaryProps) {
  return (
    <section className="stack">
      <header>
        <p className="eyebrow">Season summary</p>
        <h1>{team.name}</h1>
      </header>

      <Card>
        <p>
          Record: {team.wins}W - {team.losses}L
        </p>
        <p>ELO: {team.elo}</p>
        <Button onClick={onBackToRoster}>Back to roster</Button>
      </Card>
    </section>
  );
}
