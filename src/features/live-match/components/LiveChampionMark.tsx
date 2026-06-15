import { useState } from "react";

type LiveChampionMarkProps = {
  iconUrl?: string;
  name: string;
};

export function LiveChampionMark({ iconUrl, name }: LiveChampionMarkProps) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .replace(/[^a-zA-Z가-힣]/g, "")
    .slice(0, 2)
    .toUpperCase();
  const shouldShowIcon = iconUrl && !failed;

  return (
    <span className="live-champion-mark" aria-label={name} title={name}>
      {shouldShowIcon ? (
        <img alt="" onError={() => setFailed(true)} src={iconUrl} />
      ) : (
        initials
      )}
    </span>
  );
}
