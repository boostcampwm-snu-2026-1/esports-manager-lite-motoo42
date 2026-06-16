import {
  getAttributeTier,
  getPlayerAttributes,
  playerAttributeDescriptions,
  playerAttributeGroups,
  playerAttributeLabels,
} from "../../domain/player-attributes";
import type { Player } from "../../types/game";

type PlayerAttributePanelProps = {
  player: Player;
};

const tierLegend: Array<{ tier: string; label: string }> = [
  { tier: "worldclass", label: "90+" },
  { tier: "elite", label: "80–89" },
  { tier: "high", label: "70–79" },
  { tier: "mid", label: "60–69" },
  { tier: "low", label: "50–59" },
  { tier: "weak", label: "–49" },
];

export function PlayerAttributePanel({ player }: PlayerAttributePanelProps) {
  const attributes = getPlayerAttributes(player);

  return (
    <div className="player-attr-panel">
      <div className="player-attr-groups">
        {playerAttributeGroups.map((group) => (
          <div className="player-attr-group" key={group.key}>
            {group.attributes.map((key) => {
              const value = attributes[key];

              return (
                <div className="player-attr-row" key={key}>
                  <span className="player-attr-name">
                    {playerAttributeLabels[key]}
                    <span className="player-attr-tooltip" role="tooltip">
                      {playerAttributeDescriptions[key]}
                    </span>
                  </span>
                  <span
                    className={`player-attr-value player-attr-tier-${getAttributeTier(value)}`}
                  >
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="player-attr-legend" aria-hidden="true">
        {tierLegend.map((entry) => (
          <span className="player-attr-legend-item" key={entry.tier}>
            <span className={`player-attr-dot player-attr-tier-${entry.tier}`}>
              ●
            </span>
            {entry.label}
          </span>
        ))}
      </div>
    </div>
  );
}
