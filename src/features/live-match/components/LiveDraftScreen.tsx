// LEGACY: the standalone banpick board. The live screen now always uses the
// broadcast layout (LiveDraftBroadcastScreen), so this is no longer rendered. Kept
// intact so it can be restored by re-wiring it in LiveMatchPrototype.
import { liveMatchRoleLabels } from "../../../domain/live-match";
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

type LiveDraftScreenProps = {
  onShowMatch: () => void;
  onToggleVariant: () => void;
  set: LiveMatchSetPresentation;
};

function DraftSide({
  isRevealed,
  side,
  team,
}: {
  isRevealed: DraftRevealState["isRevealed"];
  side: LiveMatchSide;
  team: LiveMatchTeamPresentation;
}) {
  const portraitRail = <LivePlayerPortraitRail compact side={side} team={team} />;
  const pickList = (
    <div className="live-draft-picks">
      {team.players.map((player, index) => {
        const shown = isRevealed("pick", side, index);

        return (
          <article className={shown ? "" : "live-draft-pick-pending"} key={player.role}>
            {shown ? (
              <LiveChampionMark
                className="live-draft-revealing"
                iconUrl={player.champion.iconUrl}
                name={player.champion.name}
              />
            ) : (
              <span className="live-champion-mark live-draft-pending" aria-hidden="true" />
            )}
            <span>{liveMatchRoleLabels[player.role]}</span>
            <strong>{shown ? player.champion.name : "밴픽 대기"}</strong>
            <em>{player.name}</em>
          </article>
        );
      })}
    </div>
  );

  return (
    <section className={`live-draft-side live-draft-side-${side}`}>
      <div className="live-draft-team">
        <span>{team.shortName}</span>
        <strong>자동 밴픽</strong>
      </div>
      <div className="live-draft-pick-layout">
        {side === "blue" ? (
          <>
            {portraitRail}
            {pickList}
          </>
        ) : (
          <>
            {pickList}
            {portraitRail}
          </>
        )}
      </div>
    </section>
  );
}

function BanCardStrip({
  bans,
  isRevealed,
  side,
  team,
}: {
  bans: LiveMatchDraftPresentation["blueBans"];
  isRevealed: DraftRevealState["isRevealed"];
  side: LiveMatchSide;
  team: LiveMatchTeamPresentation;
}) {
  return (
    <section className={`live-ban-card-strip live-ban-card-strip-${side}`}>
      <div>
        <span>{team.shortName}</span>
        <strong>밴 카드</strong>
      </div>
      <div className="live-ban-card-list" aria-label={`${team.name} bans`}>
        {bans.map((ban, index) => {
          const shown = isRevealed("ban", side, index);

          return (
            <span key={ban.id}>
              {shown ? (
                <LiveChampionMark
                  className="live-draft-revealing"
                  iconUrl={ban.iconUrl}
                  name={ban.name}
                />
              ) : (
                <span className="live-champion-mark live-draft-pending" aria-hidden="true" />
              )}
              <b>{shown ? ban.name : "—"}</b>
            </span>
          );
        })}
      </div>
    </section>
  );
}

function FearlessPool({ draft }: { draft: LiveMatchDraftPresentation }) {
  return (
    <section className="live-fearless-pool" aria-label="피어리스 밴픽 영역">
      <div>
        <span>피어리스 밴픽</span>
        <strong>사용 불가 챔피언</strong>
      </div>
      <div className="live-fearless-rows">
        {draft.fearlessRows.map((row) => (
          <div className="live-fearless-row" key={row.label}>
            <span>{row.label}</span>
            <div className="live-fearless-slots">
              {row.champions.map((champion) => (
                <LiveChampionMark
                  iconUrl={champion.iconUrl}
                  key={`${row.label}-${champion.id}`}
                  name={champion.name}
                />
              ))}
              {Array.from({ length: 10 - row.champions.length }, (_, index) => (
                <span className="live-fearless-empty" key={`${row.label}-empty-${index}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LiveDraftScreen({
  onShowMatch,
  onToggleVariant,
  set,
}: LiveDraftScreenProps) {
  const revealKey = `${set.gameNumber}:${set.draft.blueBans
    .map((ban) => ban.id)
    .join("-")}`;
  const { isRevealed, revealAll, revealed } = useDraftReveal(revealKey);
  const isRevealing = revealed < draftRevealTotal;

  return (
    <main className="live-draft-screen">
      <header className="live-draft-screen-header">
        <div>
          <p className="eyebrow">Draft phase</p>
          <h1>밴픽 화면</h1>
        </div>
        <div className="live-draft-screen-clock">
          <span>밴픽 진행</span>
          <strong>
            {Math.min(revealed, draftRevealTotal)} / {draftRevealTotal}
          </strong>
        </div>
        <button type="button" onClick={onToggleVariant}>
          레이아웃 전환
        </button>
        {isRevealing ? (
          <button type="button" onClick={revealAll}>
            건너뛰기
          </button>
        ) : null}
        <button type="button" onClick={onShowMatch}>
          경기 시작
        </button>
      </header>
      <FearlessPool draft={set.draft} />
      <section className="live-draft-ban-row">
        <BanCardStrip
          bans={set.draft.blueBans}
          isRevealed={isRevealed}
          side="blue"
          team={set.blueTeam}
        />
        <span>현재 세트 밴 카드</span>
        <BanCardStrip
          bans={set.draft.redBans}
          isRevealed={isRevealed}
          side="red"
          team={set.redTeam}
        />
      </section>
      <section className="live-draft-board">
        <DraftSide isRevealed={isRevealed} side="blue" team={set.blueTeam} />
        <div className="live-draft-vs">
          <span>FEARLESS READY</span>
          <strong>VS</strong>
          <span>GAME {set.gameNumber}</span>
        </div>
        <DraftSide isRevealed={isRevealed} side="red" team={set.redTeam} />
      </section>
    </main>
  );
}
