import type { CareerSave, Player } from "../../types/game";
import type { MessageDraft } from "./messageDraft";

type SquadReportItem = {
  player: Player;
  priority: "normal" | "important" | "urgent";
  score: number;
  text: string;
};

function getPlayerById(career: CareerSave, playerId: string) {
  return career.lckPlayers.find((player) => player.id === playerId);
}

function getStarterPlayers(career: CareerSave) {
  return Object.values(career.userTeam.roster)
    .filter((playerId): playerId is string => Boolean(playerId))
    .map((playerId) => getPlayerById(career, playerId))
    .filter((player): player is Player => Boolean(player));
}

function createStatusItems({
  player,
  previousPlayer,
}: {
  player: Player;
  previousPlayer?: Player;
}) {
  const items: SquadReportItem[] = [];

  if (player.status.condition <= 55) {
    items.push({
      player,
      priority: "urgent",
      score: 100 - player.status.condition,
      text: `${player.name} 컨디션 ${player.status.condition}`,
    });
  }

  if (player.status.fatigue >= 85) {
    items.push({
      player,
      priority: "important",
      score: player.status.fatigue,
      text: `${player.name} 피로도 ${player.status.fatigue}`,
    });
  }

  if (
    previousPlayer &&
    previousPlayer.status.form - player.status.form >= 8 &&
    player.status.form <= 62
  ) {
    items.push({
      player,
      priority: "important",
      score: previousPlayer.status.form - player.status.form,
      text: `${player.name} 폼 ${previousPlayer.status.form} -> ${player.status.form}`,
    });
  }

  if (player.status.morale === "low" || player.status.morale === "very-low") {
    items.push({
      player,
      priority: "important",
      score: player.status.morale === "very-low" ? 80 : 65,
      text: `${player.name} 사기 ${player.status.morale === "very-low" ? "매우 낮음" : "낮음"}`,
    });
  }

  const formIncrease =
    previousPlayer && player.status.form - previousPlayer.status.form >= 8
      ? player.status.form - previousPlayer.status.form
      : 0;

  if (formIncrease > 0 && player.status.form >= 68) {
    items.push({
      player,
      priority: "normal",
      score: formIncrease,
      text: `${player.name} 폼 상승 ${previousPlayer?.status.form ?? player.status.form} -> ${player.status.form}`,
    });
  }

  return items;
}

function getReportPriority(items: SquadReportItem[]): MessageDraft["priority"] {
  if (items.some((item) => item.priority === "urgent")) {
    return "urgent";
  }

  if (items.some((item) => item.priority === "important")) {
    return "important";
  }

  return "normal";
}

function createReportBody(items: SquadReportItem[]) {
  const warningItems = items.filter((item) => item.priority !== "normal");
  const positiveItems = items.filter((item) => item.priority === "normal");
  const selectedItems =
    warningItems.length > 0
      ? [...warningItems, ...positiveItems.slice(0, 1)]
      : positiveItems.slice(0, 3);
  const itemTexts = selectedItems
    .sort((first, second) => second.score - first.score)
    .slice(0, 4)
    .map((item) => item.text);

  if (warningItems.length > 0) {
    return [
      "선발진 점검 리포트",
      ...itemTexts.map((text) => `- ${text}`),
      "권장 조치: 다음 경기 전 선발 기용과 스크림 일정을 조정하세요.",
    ].join("\n");
  }

  return [
    "선발진 상승세 리포트",
    ...itemTexts.map((text) => `- ${text}`),
    "권장 조치: 현재 분위기를 유지하되 과부하가 생기지 않게 관리하세요.",
  ].join("\n");
}

function getAverageStatusValue(
  players: Player[],
  selector: (player: Player) => number,
) {
  if (players.length === 0) {
    return 0;
  }

  return Math.round(
    players.reduce((total, player) => total + selector(player), 0) / players.length,
  );
}

function createStableWeeklyReportBody(starters: Player[]) {
  const averageCondition = getAverageStatusValue(
    starters,
    (player) => player.status.condition,
  );
  const averageFatigue = getAverageStatusValue(
    starters,
    (player) => player.status.fatigue,
  );
  const bestFormPlayer = [...starters].sort(
    (left, right) => right.status.form - left.status.form,
  )[0];
  const highestFatiguePlayer = [...starters].sort(
    (left, right) => right.status.fatigue - left.status.fatigue,
  )[0];
  const notes = [
    `선발 평균 컨디션 ${averageCondition}`,
    `평균 피로도 ${averageFatigue}`,
    bestFormPlayer
      ? `${bestFormPlayer.name} 폼 ${bestFormPlayer.status.form}`
      : undefined,
    highestFatiguePlayer && highestFatiguePlayer.status.fatigue >= 60
      ? `${highestFatiguePlayer.name} 피로도 ${highestFatiguePlayer.status.fatigue}`
      : undefined,
  ].filter((note): note is string => Boolean(note));

  return [
    "이번 주 선수단 리포트",
    ...notes.map((note) => `- ${note}`),
    "권장 조치: 상태는 안정적이지만 경기 전 로스터와 스크림 계획을 한 번 확인하세요.",
  ].join("\n");
}

export function createSquadReportMessages({
  lastMatchPlayed = false,
  nextCareer,
  previousCareer,
}: {
  lastMatchPlayed?: boolean;
  nextCareer: CareerSave;
  previousCareer: CareerSave;
}): MessageDraft[] {
  const starters = getStarterPlayers(nextCareer);
  const items = starters.flatMap((player) =>
    createStatusItems({
      player,
      previousPlayer: getPlayerById(previousCareer, player.id),
    }),
  );
  const warningItems = items.filter((item) => item.priority !== "normal");
  const positiveItems = items.filter((item) => item.priority === "normal");
  const didWeekChange =
    nextCareer.seasonState.phase === "competition" &&
    Boolean(nextCareer.seasonState.currentCompetitionId) &&
    nextCareer.seasonState.currentWeek !== previousCareer.seasonState.currentWeek;
  const shouldCreateStatusReport =
    lastMatchPlayed && (warningItems.length > 0 || positiveItems.length >= 2);
  const shouldCreateReport = didWeekChange || shouldCreateStatusReport;

  if (!shouldCreateReport) {
    return [];
  }

  const competitionId = nextCareer.seasonState.currentCompetitionId ?? "season";
  const reportKind = didWeekChange ? "weekly" : "status";

  return [
    {
      id: `squad-report-${reportKind}-${nextCareer.currentSeason}-${competitionId}-${nextCareer.seasonState.currentWeek}`,
      dateKey: nextCareer.seasonState.currentDateKey,
      dateLabel: nextCareer.seasonState.currentDateLabel,
      category: "training",
      priority: getReportPriority(items),
      title: "주간 선수단 리포트",
      body:
        items.length > 0
          ? createReportBody(items)
          : createStableWeeklyReportBody(starters),
      createdTurn: nextCareer.seasonState.currentTurn,
      source: "club",
      relatedCompetitionId: nextCareer.seasonState.currentCompetitionId ?? undefined,
    },
  ];
}
