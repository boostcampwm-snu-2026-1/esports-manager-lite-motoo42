import {
  getNextScheduledMatches,
  getPreviewMatches,
} from "../season/progressSeason";
import type {
  CareerMessage,
  CareerMessageCategory,
  CareerMessagePriority,
  CareerMessageSource,
  CareerSave,
  MatchRecord,
  MatchSchedule,
  OffseasonLogEntry,
} from "../../types/game";
import type { CareerProgressResult } from "../game-progress/progressCareer";
import type { MessageDraft } from "./messageDraft";
import { createTemplateNewsMessages } from "./newsTemplates";
import { createOffseasonWeeklySummaryMessages } from "./offseasonSummaries";
import { createSquadReportMessages } from "./squadReports";

export const maxCareerMessages = 120;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}

export function getCareerMessageDedupeKey(message: CareerMessage | MessageDraft) {
  return [
    message.source,
    message.dateKey,
    message.relatedPlayerId ??
      message.relatedTeamId ??
      message.relatedCompetitionId ??
      "general",
    message.title,
    message.body.slice(0, 120),
  ].join("::");
}

function createCareerMessage(draft: MessageDraft, index: number): CareerMessage {
  const baseKey = getCareerMessageDedupeKey(draft);

  return {
    ...draft,
    id:
      draft.id ??
      `msg-${draft.source}-${draft.dateKey}-${slugify(draft.title)}-${hashString(
        baseKey,
      )}-${index}`,
    read: draft.read ?? false,
  };
}

export function appendCareerMessages(
  career: CareerSave,
  drafts: MessageDraft[],
): CareerSave {
  if (drafts.length === 0) {
    return {
      ...career,
      messages: career.messages ?? [],
    };
  }

  const existingMessages = career.messages ?? [];
  const seenIds = new Set(existingMessages.map((message) => message.id));
  const seenKeys = new Set(existingMessages.map(getCareerMessageDedupeKey));
  const newMessages = drafts
    .map((draft, index) => createCareerMessage(draft, existingMessages.length + index))
    .filter((message) => {
      const key = getCareerMessageDedupeKey(message);

      if (seenIds.has(message.id) || seenKeys.has(key)) {
        return false;
      }

      seenIds.add(message.id);
      seenKeys.add(key);
      return true;
    });

  return {
    ...career,
    messages: [...existingMessages, ...newMessages].slice(-maxCareerMessages),
  };
}

export function markCareerMessageRead(
  career: CareerSave,
  messageId: string,
): CareerSave {
  return {
    ...career,
    messages: (career.messages ?? []).map((message) =>
      message.id === messageId ? { ...message, read: true } : message,
    ),
  };
}

export function markAllCareerMessagesRead(career: CareerSave): CareerSave {
  return {
    ...career,
    messages: (career.messages ?? []).map((message) => ({
      ...message,
      read: true,
    })),
  };
}

export function isImportantCareerMessage(message: CareerMessage) {
  return message.category === "important" || message.priority !== "normal";
}

function getUserTeamId(career: CareerSave) {
  return (
    career.seasonState.competitions
      .find(
        (competition) =>
          competition.competitionId === career.seasonState.currentCompetitionId,
      )
      ?.standings.find((entry) => entry.isUserTeam)?.teamId ?? undefined
  );
}

function isUserMatch(match: MatchSchedule, userTeamId: string | undefined) {
  return (
    Boolean(userTeamId) &&
    (match.blueTeamId === userTeamId || match.redTeamId === userTeamId)
  );
}

function getOpponentName(match: MatchSchedule, userTeamId: string | undefined) {
  if (!userTeamId) {
    return `${match.blueTeamName} vs ${match.redTeamName}`;
  }

  if (match.blueTeamId === userTeamId) {
    return match.redTeamName;
  }

  if (match.redTeamId === userTeamId) {
    return match.blueTeamName;
  }

  return `${match.blueTeamName} vs ${match.redTeamName}`;
}

function getMatchScore(record: MatchRecord) {
  return `${record.score.blueWins}-${record.score.redWins}`;
}

function createMatchResultMessages({
  nextCareer,
  previousCareer,
}: {
  nextCareer: CareerSave;
  previousCareer: CareerSave;
}): MessageDraft[] {
  const previousRecordIds = new Set(
    previousCareer.seasonState.matchRecords.map((record) => record.id),
  );
  const latestRecordIds = new Set(nextCareer.seasonState.lastMatchRecordIds);
  const latestUserRecords = nextCareer.seasonState.matchRecords.filter(
    (record) =>
      latestRecordIds.has(record.id) &&
      !previousRecordIds.has(record.id) &&
      record.userResult !== "none",
  );

  return latestUserRecords.map((record) => {
    const isWin = record.userResult === "win";
    return {
      dateKey: nextCareer.seasonState.currentDateKey,
      dateLabel: nextCareer.seasonState.currentDateLabel,
      category: "match",
      priority: isWin ? "normal" : "important",
      title: "경기 결과 도착",
      body: `${record.stageName} 경기가 ${getMatchScore(
        record,
      )} 스코어로 종료됐습니다. 승리 팀은 ${record.winnerTeamName}입니다. ${
        isWin
          ? "선수단 분위기를 이어갈 수 있는 결과입니다."
          : "다음 경기 전 전략과 선수 상태를 다시 확인하는 것이 좋습니다."
      }`,
      createdTurn: nextCareer.seasonState.currentTurn,
      source: "competition",
      relatedCompetitionId: record.competitionId,
      relatedTeamId: record.winnerTeamId,
    };
  });
}

function createScheduleMessages({
  nextCareer,
  previousCareer,
}: {
  nextCareer: CareerSave;
  previousCareer: CareerSave;
}): MessageDraft[] {
  const userTeamId = getUserTeamId(nextCareer);
  const previousPreviewIds = new Set(previousCareer.seasonState.nextMatchIds);
  const previewUserMatch = getPreviewMatches(nextCareer.seasonState).find((match) =>
    isUserMatch(match, userTeamId),
  );
  const drafts: MessageDraft[] = [];

  if (previewUserMatch && !previousPreviewIds.has(previewUserMatch.id)) {
    drafts.push({
      dateKey: nextCareer.seasonState.currentDateKey,
      dateLabel: nextCareer.seasonState.currentDateLabel,
      category: "schedule",
      priority: "important",
      title: "다음 경기 일정 안내",
      body: `${getOpponentName(
        previewUserMatch,
        userTeamId,
      )} 상대 ${previewUserMatch.stageName} ${previewUserMatch.format.toUpperCase()} 경기가 오늘 예정되어 있습니다. 상단 진행 버튼이 플레이 흐름으로 전환됩니다.`,
      createdTurn: nextCareer.seasonState.currentTurn,
      source: "competition",
      relatedCompetitionId: previewUserMatch.competitionId,
      relatedTeamId:
        previewUserMatch.blueTeamId === userTeamId
          ? previewUserMatch.redTeamId
          : previewUserMatch.blueTeamId,
    });

    return drafts;
  }

  const previousNextMatch = getNextScheduledMatches(previousCareer.seasonState).find(
    (match) => isUserMatch(match, getUserTeamId(previousCareer)),
  );
  const nextMatch = getNextScheduledMatches(nextCareer.seasonState).find((match) =>
    isUserMatch(match, userTeamId),
  );

  if (nextMatch && previousNextMatch?.id !== nextMatch.id) {
    drafts.push({
      dateKey: nextCareer.seasonState.currentDateKey,
      dateLabel: nextCareer.seasonState.currentDateLabel,
      category: "schedule",
      priority: "normal",
      title: "다음 경기 일정 안내",
      body: `${getOpponentName(
        nextMatch,
        userTeamId,
      )} 상대 ${nextMatch.stageName} ${nextMatch.format.toUpperCase()} 경기가 ${
        nextMatch.scheduledDate ?? `${nextMatch.week}주차`
      }에 예정되어 있습니다.`,
      createdTurn: nextCareer.seasonState.currentTurn,
      source: "competition",
      relatedCompetitionId: nextMatch.competitionId,
      relatedTeamId:
        nextMatch.blueTeamId === userTeamId ? nextMatch.redTeamId : nextMatch.blueTeamId,
    });
  }

  return drafts;
}

export function createProgressMessages({
  lastMatch,
  nextCareer,
  previousCareer,
}: {
  lastMatch: CareerProgressResult["lastMatch"];
  nextCareer: CareerSave;
  previousCareer: CareerSave;
}): MessageDraft[] {
  const matchMessages = createMatchResultMessages({
    nextCareer,
    previousCareer,
  });
  const scheduleMessages = createScheduleMessages({
    nextCareer,
    previousCareer,
  });
  const squadReportMessages = createSquadReportMessages({
    lastMatchPlayed: Boolean(lastMatch),
    nextCareer,
    previousCareer,
  });
  const newsMessages = createTemplateNewsMessages({
    lastMatch,
    nextCareer,
    previousCareer,
  });

  return [
    ...matchMessages,
    ...scheduleMessages,
    ...squadReportMessages,
    ...newsMessages,
  ];
}

export function appendProgressMessages(
  previousCareer: CareerSave,
  nextCareer: CareerSave,
  lastMatch: CareerProgressResult["lastMatch"],
) {
  return appendCareerMessages(
    nextCareer,
    createProgressMessages({
      lastMatch,
      nextCareer,
      previousCareer,
    }),
  );
}

function createTransferMessageFromLog({
  career,
  log,
}: {
  career: CareerSave;
  log: OffseasonLogEntry;
}): MessageDraft {
  const isImportantOffseasonNews =
    log.isUserTeamRelated ||
    log.type === "system" ||
    log.type === "rejection" ||
    log.type === "blocked";

  return {
    dateKey: career.seasonState.currentDateKey,
    dateLabel: career.seasonState.currentDateLabel,
    category: log.type === "system" ? "important" : "transfer",
    priority: isImportantOffseasonNews ? "important" : "normal",
    title: log.type === "system" ? "스토브리그 안내" : "FA 협상 결과",
    body: `${log.week}주차 ${log.day}일 기록입니다. ${log.message}`,
    createdTurn: career.seasonState.currentTurn,
    source: "offseason",
  };
}

function shouldCreateIndividualOffseasonMessage(log: OffseasonLogEntry) {
  return (
    log.isUserTeamRelated ||
    log.type === "system" ||
    log.type === "rejection" ||
    log.type === "blocked"
  );
}

export function createOffseasonLogMessages({
  nextCareer,
  previousCareer,
}: {
  nextCareer: CareerSave;
  previousCareer: CareerSave;
}) {
  const previousLogIds = new Set(
    previousCareer.seasonState.offseason?.logEntries?.map((log) => log.id) ?? [],
  );
  const nextLogs = nextCareer.seasonState.offseason?.logEntries ?? [];
  const individualMessages = nextLogs
    .filter(
      (log) =>
        !previousLogIds.has(log.id) && shouldCreateIndividualOffseasonMessage(log),
    )
    .map((log) => createTransferMessageFromLog({ career: nextCareer, log }));
  const weeklySummaryMessages = createOffseasonWeeklySummaryMessages({
    nextCareer,
    previousCareer,
  });

  return [...individualMessages, ...weeklySummaryMessages];
}

export function appendOffseasonLogMessages(
  previousCareer: CareerSave,
  nextCareer: CareerSave,
) {
  return appendCareerMessages(
    nextCareer,
    createOffseasonLogMessages({
      nextCareer,
      previousCareer,
    }),
  );
}

export function createInitialCareerMessages(career: CareerSave): CareerSave {
  const isCompetitionStart = career.seasonState.phase === "competition";

  return appendCareerMessages(career, [
    {
      dateKey: career.seasonState.currentDateKey,
      dateLabel: career.seasonState.currentDateLabel,
      category: "important",
      priority: "important",
      title: isCompetitionStart
        ? "LCK Cup 개막 준비 완료"
        : "프리시즌 스토브리그 시작",
      body: isCompetitionStart
        ? "2026 실제 LCK 로스터를 기준으로 커리어를 시작했습니다. LCK Cup부터 바로 시즌을 진행할 수 있습니다."
        : "1주차에는 기존 선수단의 재계약 또는 방출을 결정합니다. 2주차부터 FA 시장이 열립니다.",
      createdTurn: career.seasonState.currentTurn,
      source: "system",
    },
  ]);
}

export const careerMessageCategoryLabels: Record<CareerMessageCategory, string> = {
  important: "중요",
  schedule: "일정",
  match: "경기",
  training: "훈련",
  transfer: "이적",
  system: "시스템",
  news: "뉴스",
};

export const careerMessageSourceLabels: Record<CareerMessageSource, string> = {
  system: "시스템",
  club: "구단",
  competition: "대회",
  offseason: "스토브리그",
  media: "언론",
  interview: "인터뷰",
  "random-news": "뉴스",
};

export const careerMessagePriorityLabels: Record<CareerMessagePriority, string> = {
  normal: "일반",
  important: "중요",
  urgent: "긴급",
};
