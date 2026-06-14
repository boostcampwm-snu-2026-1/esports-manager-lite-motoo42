import type { CareerProgressResult } from "../game-progress/progressCareer";
import type { CareerSave, MatchRecord } from "../../types/game";
import type { MessageDraft } from "./messageDraft";

function getNewUserMatchRecords({
  nextCareer,
  previousCareer,
}: {
  nextCareer: CareerSave;
  previousCareer: CareerSave;
}) {
  const previousRecordIds = new Set(
    previousCareer.seasonState.matchRecords.map((record) => record.id),
  );
  const latestRecordIds = new Set(nextCareer.seasonState.lastMatchRecordIds);

  return nextCareer.seasonState.matchRecords.filter(
    (record) =>
      latestRecordIds.has(record.id) &&
      !previousRecordIds.has(record.id) &&
      record.userResult !== "none",
  );
}

function getMediaAngle(record: MatchRecord) {
  const winProbability = record.winProbability ?? 0.5;

  if (record.userResult === "win" && winProbability <= 0.46) {
    return {
      headline: "예상보다 강한 승리",
      body: `${record.stageName}에서 ${record.winnerTeamName}이 어려운 승부 예측을 뒤집었습니다. 현장 반응은 밴픽 적응력과 후반 집중력에 모이고 있습니다.`,
    };
  }

  if (record.userResult === "loss" && winProbability >= 0.58) {
    return {
      headline: "흔들린 우세 전망",
      body: `${record.stageName}에서 우세 전망을 살리지 못했습니다. 언론은 다음 경기 전 초반 설계와 선수단 컨디션 점검이 필요하다고 보고 있습니다.`,
    };
  }

  return null;
}

export function createTemplateNewsMessages({
  lastMatch,
  nextCareer,
  previousCareer,
}: {
  lastMatch: CareerProgressResult["lastMatch"];
  nextCareer: CareerSave;
  previousCareer: CareerSave;
}): MessageDraft[] {
  if (!lastMatch) {
    return [];
  }

  const mediaCandidate = getNewUserMatchRecords({ nextCareer, previousCareer })
    .map((candidate) => ({
      angle: getMediaAngle(candidate),
      record: candidate,
    }))
    .find((candidate) => Boolean(candidate.angle));

  if (!mediaCandidate?.angle) {
    return [];
  }

  return [
    {
      id: `template-news-${mediaCandidate.record.id}`,
      dateKey: nextCareer.seasonState.currentDateKey,
      dateLabel: nextCareer.seasonState.currentDateLabel,
      category: "news",
      priority: "normal",
      title: "미디어 리뷰",
      body: `${mediaCandidate.angle.headline}. ${mediaCandidate.angle.body}`,
      createdTurn: nextCareer.seasonState.currentTurn,
      source: "media",
      relatedCompetitionId: mediaCandidate.record.competitionId,
      relatedTeamId: mediaCandidate.record.winnerTeamId,
    },
  ];
}
