import { EvaluationStars } from "../../shared/ui/EvaluationStars";
import { PlayerPortrait } from "../../shared/ui/PlayerPortrait";
import type { CareerSave, Player, Role } from "../../types/game";

const starterSlots: Array<{ role: Role; label: string }> = [
  { role: "top", label: "TOP" },
  { role: "jungle", label: "JGL" },
  { role: "mid", label: "MID" },
  { role: "bot", label: "BOT" },
  { role: "support", label: "SUP" },
];

function getStarter(career: CareerSave, role: Role): Player | undefined {
  const playerId = career.userTeam.roster[role];

  return playerId
    ? career.lckPlayers.find((player) => player.id === playerId)
    : undefined;
}

export function StarterLineupPanel({ career }: { career: CareerSave }) {
  const starterCount = starterSlots.filter((slot) =>
    Boolean(career.userTeam.roster[slot.role]),
  ).length;

  return (
    <section
      aria-labelledby="starter-lineup-title"
      className="starter-lineup-panel"
      data-testid="dashboard-starter-lineup"
    >
      <div className="section-label-row starter-lineup-header">
        <span id="starter-lineup-title">선발 5인</span>
        <strong>{starterCount}/5 ready</strong>
      </div>

      <div className="starter-lineup-grid">
        {starterSlots.map((slot) => {
          const player = getStarter(career, slot.role);

          return (
            <article className="starter-lineup-card" key={slot.role}>
              <span className="starter-lineup-role">{slot.label}</span>
              <PlayerPortrait
                className="starter-lineup-portrait"
                player={player}
                size="lg"
              />
              <strong className="starter-lineup-name">
                {player?.name ?? "Open"}
              </strong>
              {player ? (
                <EvaluationStars compact player={player} />
              ) : (
                <span className="starter-lineup-empty">미등록</span>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
