import {
  narrateEvent,
  type LiveCommentaryTone,
  type LiveNarrationContext,
  type MatchTimelineEvent,
  type MatchTimelineEventType,
} from "../../domain/live-match";

// View model for the commentary feed: combines the domain narration (title/body/
// badge/tone) with a UI symbol and a clock string. Emoji symbols match the
// existing objective bar so the live match keeps one icon vocabulary (the app
// has no icon webfont loaded).

export type LiveCommentaryEntry = {
  badgeLabel?: string;
  body: string;
  icon: string;
  id: string;
  time: string;
  title: string;
  tone: LiveCommentaryTone;
};

const eventIcon: Record<MatchTimelineEventType, string> = {
  baron: "🟣",
  dragon: "🐉",
  elder: "🐲",
  herald: "👁",
  inhibitor: "🧱",
  kill: "⚔️",
  nexus: "🏆",
  soul: "🐉",
  tower: "🏰",
};

export function formatClock(timeSec: number): string {
  const total = Math.max(0, Math.round(timeSec));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function buildCommentaryEntries(
  events: MatchTimelineEvent[],
  context: LiveNarrationContext,
): LiveCommentaryEntry[] {
  return events.map((event) => {
    const narration = narrateEvent(event, context);

    return {
      badgeLabel: narration.badgeLabel,
      body: narration.body,
      icon: eventIcon[event.type],
      id: event.id,
      time: formatClock(event.timeSec),
      title: narration.title,
      tone: narration.tone,
    };
  });
}
