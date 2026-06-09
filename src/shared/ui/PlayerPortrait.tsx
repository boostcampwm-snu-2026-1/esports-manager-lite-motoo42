import { useEffect, useState } from "react";
import type { Player } from "../../types/game";

type PlayerPortraitProps = {
  player: Pick<Player, "name" | "portraitUrl"> | null | undefined;
  className?: string;
  size?: "sm" | "md" | "lg";
};

function getInitials(player: PlayerPortraitProps["player"]) {
  if (!player) {
    return "--";
  }

  return player.name.slice(0, 2).toUpperCase();
}

export function PlayerPortrait({
  className = "",
  player,
  size = "md",
}: PlayerPortraitProps) {
  const [failed, setFailed] = useState(false);
  const portraitUrl = player?.portraitUrl;
  const shouldShowImage = Boolean(portraitUrl) && !failed;
  const classes = [
    "player-portrait",
    `player-portrait-${size}`,
    shouldShowImage ? "player-portrait-image" : "player-portrait-fallback",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    setFailed(false);
  }, [portraitUrl]);

  return (
    <span className={classes} data-testid="player-portrait">
      {shouldShowImage ? (
        <img
          alt={`${player?.name ?? "Player"} portrait`}
          src={portraitUrl}
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(player)}</span>
      )}
    </span>
  );
}
