import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { liveMatchRoleLabels } from "../../../domain/live-match";
import { createSeededRandom } from "../../../domain/rng/createSeededRandom";
import type {
  LiveMatchDraftPresentation,
  LiveMatchSetPresentation,
  LiveMatchSide,
  LiveMatchTeamPresentation,
} from "../../../domain/live-match";
import {
  type DraftRevealState,
  draftRevealTotal,
  useDraftReveal,
} from "./draftReveal";
import { LiveChampionMark } from "./LiveChampionMark";
import { LivePlayerPortraitRail } from "./LivePlayerPortraitRail";

const pickColumnGapPx = 6;

// Deterministic Fisher–Yates — the order in which the slots fill (centre → out by
// default) is reshuffled per team so blue and red don't deal in the same sequence.
function seededPermutation(seed: string, count: number): number[] {
  const random = createSeededRandom(seed);
  const order = Array.from({ length: count }, (_, index) => index);

  for (let index = count - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [order[index], order[swap]] = [order[swap], order[index]];
  }

  return order;
}

// Broadcast-style draft that reuses the game screen's frame: the player-portrait
// rails stay exactly where they are during play, the centre (where the commentary
// feed sits) holds the bans + fearless pool, and the bottom (where the stat board
// sits) holds the ten picks. Going draft → game then keeps the ten faces in place.

type LiveDraftBroadcastScreenProps = {
  instant?: boolean;
  onShowMatch: () => void;
  seriesTags: ReactNode;
  set: LiveMatchSetPresentation;
};

function BanRow({
  bans,
  isRevealed,
  side,
}: {
  bans: LiveMatchDraftPresentation["blueBans"];
  isRevealed: DraftRevealState["isRevealed"];
  side: LiveMatchSide;
}) {
  return (
    <div className={`live-broadcast-ban-row live-broadcast-ban-row-${side}`}>
      {bans.map((ban, index) =>
        isRevealed("ban", side, index) ? (
          <LiveChampionMark
            className="live-draft-revealing"
            iconUrl={ban.iconUrl}
            key={ban.id}
            name={ban.name}
          />
        ) : (
          <span
            className="live-champion-mark live-draft-pending"
            key={ban.id}
            aria-hidden="true"
          />
        ),
      )}
    </div>
  );
}

function PickColumn({
  instant,
  isRevealed,
  pickOrdinal,
  side,
  team,
}: {
  instant: boolean;
  isRevealed: DraftRevealState["isRevealed"];
  pickOrdinal: DraftRevealState["pickOrdinal"];
  side: LiveMatchSide;
  team: LiveMatchTeamPresentation;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [pitch, setPitch] = useState(0);

  useLayoutEffect(() => {
    const element = railRef.current;

    if (!element) {
      return;
    }

    const measure = () =>
      setPitch((element.clientWidth + pickColumnGapPx) / team.players.length);

    measure();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, [team.players.length]);

  // Final layout: role → display slot (blue reversed so supports are on the edges).
  const displaySlots =
    side === "blue"
      ? team.players.map((_, index) => team.players.length - 1 - index)
      : team.players.map((_, index) => index);

  // FIXED pick-slot fill order (the draft turn sequence, identical every game).
  // The randomness lives in WHICH ROLE is picked at each step (pickOrdinal), not
  // here — these slots always fill in the same centre→out order.
  const dealSlotByPickStep = displaySlots;

  const allRevealed = displaySlots.every((roleIndex) =>
    isRevealed("pick", side, roleIndex),
  );
  const [settled, setSettled] = useState(instant);

  useEffect(() => {
    if (instant) {
      setSettled(true);

      return;
    }

    if (!allRevealed) {
      setSettled(false);

      return;
    }

    const timer = window.setTimeout(() => setSettled(true), 1000);

    return () => window.clearTimeout(timer);
  }, [allRevealed, instant]);

  return (
    <div
      className={`live-broadcast-picks-col live-broadcast-picks-col-${side}`}
      ref={railRef}
    >
      {displaySlots.map((roleIndex, slot) => {
        const player = team.players[roleIndex];
        const shown = isRevealed("pick", side, roleIndex);
        // The whole card (role label included) first lands in its FIXED draft-turn
        // slot in pick order — so the jumbled, per-team role order is visible — then
        // on settle it slides to its role slot. The slot order never changes; only
        // which role fills each step (pickOrdinal) is seeded per side.
        const dealSlot = dealSlotByPickStep[pickOrdinal(side, roleIndex)];
        const offset = settled ? 0 : (dealSlot - slot) * pitch;

        return (
          <article
            className={`live-broadcast-pick${shown ? "" : " live-draft-pick-pending"}`}
            key={player.role}
            style={{
              transform: settled ? undefined : `translateX(${offset}px)`,
              transition: settled ? "transform 0.5s ease" : "none",
            }}
          >
            <span className="live-broadcast-pick-portrait">
              {shown ? (
                <LiveChampionMark
                  className="live-draft-revealing"
                  iconUrl={player.champion.iconUrl}
                  name={player.champion.name}
                />
              ) : (
                <span
                  className="live-champion-mark live-draft-pending"
                  aria-hidden="true"
                />
              )}
            </span>
            <div className="live-broadcast-pick-meta">
              {/* Role + player reveal in pick order, so the jumbled draft order is
                  visible as cards land; the champion name waits until the card settles
                  into its role slot so the actual pick isn't given away while dealing.
                  Hidden cells keep their space (visibility) to avoid height jitter. */}
              <span className={shown ? "" : "live-broadcast-pick-name-hidden"}>
                {liveMatchRoleLabels[player.role]}
              </span>
              <strong
                className={settled ? "" : "live-broadcast-pick-name-hidden"}
              >
                {player.champion.name}
              </strong>
              <em className={shown ? "" : "live-broadcast-pick-name-hidden"}>
                {player.name}
              </em>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function LiveDraftBroadcastScreen({
  instant = false,
  onShowMatch,
  seriesTags,
  set,
}: LiveDraftBroadcastScreenProps) {
  const revealKey = `${set.gameNumber}:${set.draft.blueBans
    .map((ban) => ban.id)
    .join("-")}`;
  const { isRevealed, pickOrdinal, revealAll, revealed } = useDraftReveal(
    revealKey,
    instant,
    set.pickOrder,
  );
  const isRevealing = revealed < draftRevealTotal;

  return (
    <>
      <div className="live-broadcast-draft-strip">
        <div className="live-broadcast-draft-status">
          <span className="live-broadcast-draft-phase">밴픽 진행</span>
          <span className="live-broadcast-draft-counter">
            {Math.min(revealed, draftRevealTotal)} / {draftRevealTotal}
          </span>
        </div>
        <div className="live-broadcast-draft-tags">{seriesTags}</div>
        <div className="live-broadcast-draft-actions">
          {isRevealing ? (
            <button type="button" onClick={revealAll}>
              건너뛰기
            </button>
          ) : null}
          <button type="button" onClick={onShowMatch}>
            경기 시작
          </button>
        </div>
      </div>

      <main className="live-match-main live-broadcast-draft-main">
        <LivePlayerPortraitRail side="blue" team={set.blueTeam} />
        <section className="live-broadcast-draft-bans" aria-label="밴 카드">
          {set.draft.fearlessRows.length > 0 ? (
            <div className="live-broadcast-fearless">
              <span className="live-broadcast-fearless-title">
                피어리스 · 사용 불가
              </span>
              <div className="live-broadcast-fearless-rows">
                {set.draft.fearlessRows.map((row) => (
                  <div className="live-broadcast-fearless-row" key={row.label}>
                    <span>{row.label}</span>
                    <div className="live-broadcast-fearless-slots">
                      {row.champions.map((champion) => (
                        <LiveChampionMark
                          iconUrl={champion.iconUrl}
                          key={`${row.label}-${champion.id}`}
                          name={champion.name}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div className="live-broadcast-bans-row">
            <BanRow bans={set.draft.blueBans} isRevealed={isRevealed} side="blue" />
            <span className="live-broadcast-bans-label">BANS</span>
            <BanRow bans={set.draft.redBans} isRevealed={isRevealed} side="red" />
          </div>
        </section>
        <LivePlayerPortraitRail side="red" team={set.redTeam} />
      </main>

      <section className="live-broadcast-draft-picks" aria-label="픽">
        <PickColumn
          instant={instant}
          isRevealed={isRevealed}
          pickOrdinal={pickOrdinal}
          side="blue"
          team={set.blueTeam}
        />
        <div className="live-broadcast-picks-center">
          <strong>VS</strong>
          <span>GAME {set.gameNumber}</span>
        </div>
        <PickColumn
          instant={instant}
          isRevealed={isRevealed}
          pickOrdinal={pickOrdinal}
          side="red"
          team={set.redTeam}
        />
      </section>
    </>
  );
}
