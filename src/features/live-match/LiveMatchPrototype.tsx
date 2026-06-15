import { useMemo, useState } from "react";

import { createMockLiveMatchPresentation } from "../../domain/live-match";
import type { CareerSave } from "../../types/game";
import { LiveDraftScreen } from "./components/LiveDraftScreen";
import { LiveMatchScreen } from "./components/LiveMatchScreen";
import { LiveMatchTopbar } from "./components/LiveMatchTopbar";

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

  return (
    <section
      aria-label="매치엔진 UI 프로토타입"
      className={`live-match-prototype live-match-prototype-${screen}`}
    >
      <LiveMatchTopbar presentation={presentation} />
      {screen === "draft" ? (
        <LiveDraftScreen
          onShowMatch={() => setScreen("match")}
          set={presentation.currentSet}
        />
      ) : (
        <LiveMatchScreen
          onExit={onExit}
          onShowDraft={() => setScreen("draft")}
          set={presentation.currentSet}
        />
      )}
    </section>
  );
}
