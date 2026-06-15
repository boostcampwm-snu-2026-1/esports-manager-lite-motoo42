import { liveMatchRoleLabels } from "../../../domain/live-match";
import type {
  LiveMatchDraftPresentation,
  LiveMatchSetPresentation,
  LiveMatchSide,
  LiveMatchTeamPresentation,
} from "../../../domain/live-match";
import { LiveChampionMark } from "./LiveChampionMark";
import { LivePlayerPortraitRail } from "./LivePlayerPortraitRail";

type LiveDraftScreenProps = {
  onShowMatch: () => void;
  set: LiveMatchSetPresentation;
};

function DraftSide({ side, team }: { side: LiveMatchSide; team: LiveMatchTeamPresentation }) {
  const portraitRail = <LivePlayerPortraitRail compact side={side} team={team} />;
  const pickList = (
    <div className="live-draft-picks">
      {team.players.map((player) => (
        <article key={player.role}>
          <LiveChampionMark
            iconUrl={player.champion.iconUrl}
            name={player.champion.name}
          />
          <span>{liveMatchRoleLabels[player.role]}</span>
          <strong>{player.champion.name}</strong>
          <em>{player.name}</em>
        </article>
      ))}
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
  side,
  team,
}: {
  bans: LiveMatchDraftPresentation["blueBans"];
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
        {bans.map((ban) => (
          <span key={ban.id}>
            <LiveChampionMark iconUrl={ban.iconUrl} name={ban.name} />
            <b>{ban.name}</b>
          </span>
        ))}
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

export function LiveDraftScreen({ onShowMatch, set }: LiveDraftScreenProps) {
  return (
    <main className="live-draft-screen">
      <header className="live-draft-screen-header">
        <div>
          <p className="eyebrow">Draft phase</p>
          <h1>밴픽 화면</h1>
        </div>
        <div className="live-draft-screen-clock">
          <span>고정 재생</span>
          <strong>12s</strong>
        </div>
        <button type="button" onClick={onShowMatch}>
          경기 화면으로
        </button>
      </header>
      <FearlessPool draft={set.draft} />
      <section className="live-draft-ban-row">
        <BanCardStrip bans={set.draft.blueBans} side="blue" team={set.blueTeam} />
        <span>현재 세트 밴 카드</span>
        <BanCardStrip bans={set.draft.redBans} side="red" team={set.redTeam} />
      </section>
      <section className="live-draft-board">
        <DraftSide side="blue" team={set.blueTeam} />
        <div className="live-draft-vs">
          <span>FEARLESS READY</span>
          <strong>VS</strong>
          <span>GAME {set.gameNumber}</span>
        </div>
        <DraftSide side="red" team={set.redTeam} />
      </section>
    </main>
  );
}
