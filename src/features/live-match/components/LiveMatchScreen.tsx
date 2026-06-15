import type {
  LiveMatchObjectiveSnapshot,
  LiveMatchSetPresentation,
  LiveMatchSide,
  LiveMatchTeamPresentation,
} from "../../../domain/live-match";
import type { LiveCommentaryEntry } from "../liveCommentaryView";
import { LivePlayerPortraitRail } from "./LivePlayerPortraitRail";
import { LiveStatsBoard } from "./LiveStatsBoard";

type LiveMatchScreenProps = {
  commentary: LiveCommentaryEntry[];
  onExit: () => void;
  onShowDraft: () => void;
  set: LiveMatchSetPresentation;
};

const objectiveIcons: Array<{
  icon: string;
  key: keyof LiveMatchObjectiveSnapshot;
  label: string;
}> = [
  { key: "dragons", icon: "🐉", label: "드래곤" },
  { key: "heralds", icon: "👁", label: "전령" },
  { key: "barons", icon: "🟣", label: "바론" },
  { key: "towers", icon: "🏰", label: "타워" },
];

function ObjectiveRow({ side, team }: { side: LiveMatchSide; team: LiveMatchTeamPresentation }) {
  const items = side === "blue" ? objectiveIcons : [...objectiveIcons].reverse();

  return (
    <div className={`live-objective-row live-objective-row-${side}`}>
      {items.map((objective) => (
        <span
          aria-label={`${team.name} ${objective.label} ${team.objectives[objective.key]}개`}
          key={objective.key}
          title={objective.label}
        >
          <b>{objective.icon}</b>
          {team.objectives[objective.key]}
        </span>
      ))}
    </div>
  );
}

export function LiveMatchScreen({
  commentary,
  onExit,
  onShowDraft,
  set,
}: LiveMatchScreenProps) {
  return (
    <>
      <div className="live-objective-strip">
        <ObjectiveRow side="blue" team={set.blueTeam} />
        <span className="live-objective-center">오브젝트</span>
        <ObjectiveRow side="red" team={set.redTeam} />
      </div>

      <main className="live-match-main">
        <LivePlayerPortraitRail side="blue" team={set.blueTeam} />

        <section className="live-commentary-stage">
          <div className="live-commentary-hero">
            <h1>문자중계</h1>
            <div className="live-commentary-actions">
              <button type="button" onClick={onShowDraft}>
                밴픽 화면
              </button>
              <button type="button">빠른 진행</button>
              <button type="button">세트 결과</button>
              <button type="button" onClick={onExit}>
                허브로
              </button>
            </div>
          </div>
          <div className="live-commentary-feed">
            {commentary.map((entry) => (
              <article
                className={`live-commentary-event live-tone-${entry.tone}`}
                key={entry.id}
              >
                <time>{entry.time}</time>
                <div>
                  <strong>
                    <span className="live-event-icon" aria-hidden="true">
                      {entry.icon}
                    </span>
                    {entry.title}
                    {entry.badgeLabel ? (
                      <span className="live-event-badge">{entry.badgeLabel}</span>
                    ) : null}
                  </strong>
                  <p>{entry.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <LivePlayerPortraitRail side="red" team={set.redTeam} />
      </main>

      <LiveStatsBoard set={set} />
    </>
  );
}
