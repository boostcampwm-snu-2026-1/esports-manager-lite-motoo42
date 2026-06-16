import { useState } from "react";

type LiveChampionMarkProps = {
  className?: string;
  iconUrl?: string;
  name: string;
};

export function LiveChampionMark({
  className,
  iconUrl,
  name,
}: LiveChampionMarkProps) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .replace(/[^a-zA-Z가-힣]/g, "")
    .slice(0, 2)
    .toUpperCase();
  const shouldShowIcon = iconUrl && !failed;

  return (
    <span
      className={`live-champion-mark${className ? ` ${className}` : ""}`}
      aria-label={name}
      title={name}
    >
      {shouldShowIcon ? (
        <img alt="" onError={() => setFailed(true)} src={iconUrl} />
      ) : (
        initials
      )}
    </span>
  );
}
