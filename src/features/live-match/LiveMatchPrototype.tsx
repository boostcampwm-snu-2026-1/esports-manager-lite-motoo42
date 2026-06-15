import { useMemo, useState } from "react";

import {
  applyStatSnapshotToTeams,
  createMockLiveMatchPresentation,
} from "../../domain/live-match";
import type { CareerSave } from "../../types/game";
import { LiveDraftScreen } from "./components/LiveDraftScreen";
import { LiveMatchScreen } from "./components/LiveMatchScreen";
import { LiveMatchTopbar } from "./components/LiveMatchTopbar";
import { buildCommentaryEntries, formatClock } from "./liveCommentaryView";
import { useMatchPlayback } from "./useMatchPlayback";

type LiveMatchPrototypeProps = {
  career: CareerSave | null;
  onExit: () => void;
};

export function LiveMatchPrototype({ career, onExit }: LiveMatchPrototypeProps) {
  const [screen, setScreen] = useState<"match" | "draft">("match");
  const presentation = useMemo(
    () => createMockLiveMatchPresentation(career),
    [career],
  );
  const playback = useMatchPlayback({ timeline: presentation.timeline });

  const liveTeams = useMemo(
    () =>
      applyStatSnapshotToTeams({
        blueTeam: presentation.currentSet.blueTeam,
        redTeam: presentation.currentSet.redTeam,
        snapshot: playback.snapshot,
      }),
    [presentation, playback.snapshot],
  );

  const liveSet = useMemo(
    () => ({
      ...presentation.currentSet,
      blueTeam: liveTeams.blueTeam,
      gameTime: formatClock(playback.gameTimeSec),
      redTeam: liveTeams.redTeam,
    }),
    [presentation.currentSet, liveTeams, playback.gameTimeSec],
  );

  const livePresentation = useMemo(
    () => ({ ...presentation, currentSet: liveSet }),
    [presentation, liveSet],
  );

  const commentary = useMemo(
    () => buildCommentaryEntries(playback.revealedEvents, presentation.narrationContext),
    [playback.revealedEvents, presentation.narrationContext],
  );

  return (
    <section
      aria-label="매치엔진 UI 프로토타입"
      className={`live-match-prototype live-match-prototype-${screen}`}
    >
      <LiveMatchTopbar presentation={livePresentation} />
      {screen === "draft" ? (
        <LiveDraftScreen
          onShowMatch={() => setScreen("match")}
          set={liveSet}
        />
      ) : (
        <LiveMatchScreen
          commentary={commentary}
          onExit={onExit}
          onShowDraft={() => setScreen("draft")}
          playback={playback}
          set={liveSet}
        />
      )}
    </section>
  );
}
