import { describe, expect, it } from "vitest";
import {
  advanceLckCupAfterCompletedWeek,
  completeStoveLeague,
  createInitialSeasonState,
  getLckCupAdvancement,
  getLckCupGroupPointSummary,
  getLckCupStageNames,
  getNextLckCupKnockoutSchedule,
  lckCupFinalsWeek,
  lckCupGroupBattleWeeks,
  lckCupPlayInRound1Week,
  recordCompletedMatches,
  transitionFromLckCupToLckRounds12,
} from "../../src/domain/season";
import { getLckSchedulePolicyIssues } from "../../src/domain/season/lckSchedulePolicy";
import type { MatchRecord, MatchSchedule } from "../../src/types/game";

function createActiveSeason() {
  return completeStoveLeague(
    createInitialSeasonState({
      seasonNumber: 1,
      userTeamName: "T1",
    }),
  );
}

function createBlueWinRecord(match: MatchSchedule, index: number): MatchRecord {
  const isBo5 = match.format === "bo5";

  return {
    id: `${match.id}-record-${index}`,
    scheduleId: match.id,
    competitionId: match.competitionId,
    week: match.week,
    stageName: match.stageName,
    winnerSide: "blue",
    winnerTeamId: match.blueTeamId,
    winnerTeamName: match.blueTeamName,
    score: {
      blueWins: isBo5 ? 3 : 2,
      redWins: isBo5 ? 1 : 0,
    },
    userResult:
      match.blueTeamName === "T1"
        ? "win"
        : match.redTeamName === "T1"
          ? "loss"
          : "none",
    log: [`${match.blueTeamName} beat ${match.redTeamName}`],
    createdAtTurn: index + 1,
  };
}

describe("LCK Cup simplified format", () => {
  it("creates balanced snake groups and a compressed 25-series group battle schedule", () => {
    const season = createActiveSeason();
    const lckCup = season.competitions.find(
      (competition) => competition.competitionId === "lck-cup",
    );
    const stageNames = getLckCupStageNames();
    const groupBattleSchedule =
      lckCup?.schedule.filter((match) => match.stageName === stageNames.groupBattle) ??
      [];
    const superWeekSchedule =
      lckCup?.schedule.filter((match) => match.stageName === stageNames.superWeek) ??
      [];
    const baronTeams =
      lckCup?.standings
        .filter((entry) => entry.lckCupGroup === "baron")
        .sort((left, right) => left.initialSeed - right.initialSeed) ?? [];
    const elderTeams =
      lckCup?.standings
        .filter((entry) => entry.lckCupGroup === "elder")
        .sort((left, right) => left.initialSeed - right.initialSeed) ?? [];

    expect(lckCup?.standings.filter((entry) => entry.lckCupGroup === "baron").map((entry) => entry.initialSeed).sort((left, right) => left - right)).toEqual([1, 4, 5, 8, 9]);
    expect(lckCup?.standings.filter((entry) => entry.lckCupGroup === "elder").map((entry) => entry.initialSeed).sort((left, right) => left - right)).toEqual([2, 3, 6, 7, 10]);
    expect(lckCup?.schedule).toHaveLength(25);
    expect(groupBattleSchedule).toHaveLength(20);
    expect(superWeekSchedule).toHaveLength(5);
    expect(groupBattleSchedule.every((match) => match.format === "bo3")).toBe(true);
    expect(superWeekSchedule.every((match) => match.format === "bo5")).toBe(true);
    expect(lckCup?.schedule.every((match) => match.fearlessEnabled)).toBe(true);
    expect(new Set(lckCup?.schedule.map((match) => match.week))).toEqual(
      new Set([1, 2, 3]),
    );
    expect(lckCup?.schedule.filter((match) => match.week === 1)).toHaveLength(10);
    expect(lckCup?.schedule.filter((match) => match.week === 2)).toHaveLength(10);
    expect(lckCup?.schedule.filter((match) => match.week === 3)).toHaveLength(5);
    expect(getLckSchedulePolicyIssues(lckCup?.schedule ?? [])).toEqual([]);
    expect(
      superWeekSchedule.map((match) =>
        [match.blueTeamId, match.redTeamId].sort().join(" vs "),
      ),
    ).toEqual(
      [4, 3, 2, 1, 0].map((index) =>
        [baronTeams[index].teamId, elderTeams[index].teamId].sort().join(" vs "),
      ),
    );
  });

  it("creates play-in matches after the group battle ends", () => {
    const season = createActiveSeason();
    const groupBattleRecords = season.scheduledMatches.map(createBlueWinRecord);
    const recordedSeason = recordCompletedMatches(season, groupBattleRecords);
    const advancedSeason = advanceLckCupAfterCompletedWeek(
      recordedSeason,
      lckCupGroupBattleWeeks,
    );
    const lckCup = advancedSeason.competitions.find(
      (competition) => competition.competitionId === "lck-cup",
    );

    expect(lckCup?.schedule).toHaveLength(27);
    expect(lckCup?.currentStageName).toBe("Play-In Round 1");
    expect(
      advancedSeason.scheduledMatches.filter(
        (match) => match.week === lckCupPlayInRound1Week,
      ),
    ).toHaveLength(2);
  });

  it("calculates group winners and play-in entrants from group battle records", () => {
    const season = createActiveSeason();
    const lckCup = season.competitions.find(
      (competition) => competition.competitionId === "lck-cup",
    );

    if (!lckCup) {
      throw new Error("LCK Cup state was not created.");
    }

    const records = lckCup.schedule.map(createBlueWinRecord);
    const summary = getLckCupGroupPointSummary(lckCup, records);
    const advancement = getLckCupAdvancement(lckCup, records);
    const playInRound1 = getNextLckCupKnockoutSchedule(
      lckCup,
      records,
      lckCupGroupBattleWeeks,
    );
    const stageNames = getLckCupStageNames();
    const superWeekRecords = records.filter((record) =>
      lckCup.schedule.some(
        (match) =>
          match.id === record.scheduleId && match.stageName === stageNames.superWeek,
      ),
    );

    expect(["baron", "elder"]).toContain(summary.winnerGroup);
    expect(advancement.directPlayoffTeams).toHaveLength(3);
    expect(advancement.playInTeams).toHaveLength(6);
    expect(advancement.eliminatedTeam).toBeDefined();
    expect(playInRound1).toHaveLength(2);
    expect(playInRound1.every((match) => match.format === "bo3")).toBe(true);
    expect(superWeekRecords).toHaveLength(5);
    expect(
      superWeekRecords.every((record) =>
        record.score.blueWins === 3 || record.score.redWins === 3,
      ),
    ).toBe(true);
  });

  it("can generate the simplified LCK Cup through finals and First Stand qualification", () => {
    let season = createActiveSeason();

    for (let week = 1; week <= lckCupFinalsWeek; week += 1) {
      const weekMatches = season.scheduledMatches.filter(
        (match) => match.week === week && match.status === "scheduled",
      );

      expect(weekMatches.length).toBeGreaterThan(0);

      season = recordCompletedMatches(
        season,
        weekMatches.map((match, index) =>
          createBlueWinRecord(match, week * 10 + index),
        ),
      );
      season = advanceLckCupAfterCompletedWeek(season, week);
    }

    const lckCup = season.competitions.find(
      (competition) => competition.competitionId === "lck-cup",
    );
    const firstStand = season.competitions.find(
      (competition) => competition.competitionId === "first-stand",
    );

    expect(lckCup?.status).toBe("completed");
    expect(lckCup?.completed).toBe(true);
    expect(lckCup?.qualifiedTeamIds).toHaveLength(2);
    expect(lckCup?.winnerTeamId).toBeDefined();
    expect(firstStand?.status).toBe("available");
  });

  it("can placeholder-complete First Stand and activate LCK Rounds 1-2 after LCK Cup", () => {
    let season = createActiveSeason();

    for (let week = 1; week <= lckCupFinalsWeek; week += 1) {
      const weekMatches = season.scheduledMatches.filter(
        (match) =>
          match.competitionId === "lck-cup" &&
          match.week === week &&
          match.status === "scheduled",
      );

      season = recordCompletedMatches(
        season,
        weekMatches.map((match, index) =>
          createBlueWinRecord(match, week * 10 + index),
        ),
      );
      season = advanceLckCupAfterCompletedWeek(season, week);
    }

    const transitionedSeason = transitionFromLckCupToLckRounds12(season);
    const firstStand = transitionedSeason.competitions.find(
      (competition) => competition.competitionId === "first-stand",
    );
    const lckRounds = transitionedSeason.competitions.find(
      (competition) => competition.competitionId === "lck-rounds-1-2",
    );

    expect(firstStand?.status).toBe("completed");
    expect(firstStand?.completed).toBe(true);
    expect(firstStand?.currentStageName).toContain("Placeholder");
    expect(transitionedSeason.currentCompetitionId).toBe("lck-rounds-1-2");
    expect(transitionedSeason.currentDateKey).toBe("2026-04-01");
    expect(lckRounds?.status).toBe("active");
    expect(lckRounds?.schedule).toHaveLength(90);
  });
});
