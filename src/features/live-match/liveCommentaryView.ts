import {
  narrateEvent,
  type DragonType,
  type LiveCommentaryTone,
  type LiveNarrationContext,
  type MatchTimelineEvent,
  type MatchTimelineEventType,
} from "../../domain/live-match";

// View model for the commentary feed: combines the domain narration (title/body/
// badge/tone) with the event type (the screen maps it to a Tabler icon) and a
// clock string.

export type LiveCommentaryEntry = {
  badgeLabel?: string;
  body: string;
  dragonType?: DragonType;
  id: string;
  time: string;
  title: string;
  tone: LiveCommentaryTone;
  type: MatchTimelineEventType;
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
      dragonType: event.dragonType,
      id: event.id,
      time: formatClock(event.timeSec),
      title: narration.title,
      tone: narration.tone,
      type: event.type,
    };
  });
}
