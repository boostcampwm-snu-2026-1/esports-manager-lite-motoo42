import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createInitialCareer } from "../../src/domain/career/createInitialCareer";
import { completeSeasonAfterWorlds } from "../../src/domain/season";
import { SeasonSummary } from "../../src/features/season-summary";
import type { CareerSave, PlayerContract } from "../../src/types/game";

const contracts: PlayerContract[] = [
  {
    playerId: "lck-top-01",
    salary: 115,
    type: "one-year",
    guaranteedYears: 1,
    remainingYears: 1,
  },
  {
    playerId: "lck-jungle-01",
    salary: 120,
    type: "two-year",
    guaranteedYears: 2,
    remainingYears: 2,
  },
];

function createSummaryCareer(): CareerSave {
  const career = createInitialCareer("T1");
  const worldsCompletedCareer: CareerSave = {
    ...career,
    userTeam: {
      ...career.userTeam,
      contracts,
      wins: 34,
      losses: 12,
      elo: 1688,
    },
    seasonState: {
      ...career.seasonState,
      phase: "competition",
      currentCompetitionId: "worlds",
      currentDateKey: "2026-11-08",
      currentDateLabel: "2026 Worlds Final",
      worlds: {
        status: "completed",
        playInGroups: [],
        groupStageGroups: [],
        knockoutTeamIds: [],
        knockoutTeamNames: [],
        championTeamId: "t1",
        championTeamName: "T1",
        runnerUpTeamId: "gen-g",
        runnerUpTeamName: "Gen.G",
      },
      competitions: career.seasonState.competitions.map((competition) =>
        competition.competitionId === "worlds"
          ? {
              ...competition,
              status: "completed" as const,
              winnerTeamId: "t1",
              winnerTeamName: "T1",
              completed: true,
            }
          : competition,
      ),
    },
  };

  return completeSeasonAfterWorlds(worldsCompletedCareer);
}

describe("SeasonSummary", () => {
  it("renders season results and enters the offseason market", () => {
    const onStartOffseason = vi.fn();

    render(
      <SeasonSummary
        career={createSummaryCareer()}
        onStartOffseason={onStartOffseason}
        onViewRoster={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "2026 시즌의 발자취" }),
    ).toBeVisible();
    expect(screen.getByText("34W 12L")).toBeVisible();
    expect(screen.getByText("1688")).toBeVisible();
    expect(screen.getAllByText("T1").length).toBeGreaterThan(0);
    expect(screen.getByText("Zeus")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "스토브리그 진입" }));

    expect(onStartOffseason).toHaveBeenCalledTimes(1);
  });

  it("renders season history cards and switches the selected season detail", () => {
    const career = createSummaryCareer();
    const firstSummary = career.seasonHistory[0];
    const multiSeasonCareer: CareerSave = {
      ...career,
      seasonHistory: [
        {
          ...firstSummary,
          seasonNumber: 1,
          yearLabel: 2026,
          lckResult: "우승",
          finalElo: 1700,
          finalRecord: { wins: 40, losses: 10 },
          worldsChampionTeamName: "T1",
          offseasonSummary: {
            renewedPlayerIds: ["lck-top-01"],
            releasedPlayerIds: ["lck-jungle-01"],
            signedPlayerIds: ["lck-mid-01"],
            aiSigningCount: 2,
            notableLogEntries: [
              {
                id: "history-log-1",
                day: 7,
                week: 1,
                type: "renewal",
                message: "Zeus가 팀에 남았습니다.",
              },
            ],
          },
        },
        {
          ...firstSummary,
          seasonNumber: 2,
          yearLabel: 2027,
          lckResult: "3위",
          finalElo: 1620,
          finalRecord: { wins: 31, losses: 20 },
          worldsChampionTeamName: "Gen.G",
          offseasonSummary: undefined,
        },
      ],
    };

    render(
      <SeasonSummary
        career={multiSeasonCareer}
        onStartOffseason={vi.fn()}
        onViewRoster={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /2026/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /2027/ })).toBeVisible();
    expect(screen.getByText("40W 10L")).toBeVisible();
    expect(screen.getByText("Zeus가 팀에 남았습니다.")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /2027/ }));

    expect(
      screen.getByRole("heading", { name: "2027 시즌의 발자취" }),
    ).toBeVisible();
    expect(screen.getByText("31W 20L")).toBeVisible();
    expect(screen.getByText("1620")).toBeVisible();
    expect(
      screen.getAllByText("아직 이 시즌에 저장된 선수 변화 기록이 없습니다.")
        .length,
    ).toBeGreaterThan(0);
  });

  it("disables offseason entry when the career is completed", () => {
    const completedCareer: CareerSave = {
      ...createSummaryCareer(),
      currentSeason: 20,
      seasonState: {
        ...createSummaryCareer().seasonState,
        phase: "completed",
        offseason: {
          ...createSummaryCareer().seasonState.offseason!,
          status: "career-completed",
          nextSeasonNumber: undefined,
        },
      },
    };

    render(
      <SeasonSummary
        career={completedCareer}
        onStartOffseason={vi.fn()}
        onViewRoster={vi.fn()}
      />,
    );

    const offseasonButton = screen.getByRole("button", {
      name: "스토브리그 진입",
    });

    expect(offseasonButton).toBeDisabled();
  });
});
