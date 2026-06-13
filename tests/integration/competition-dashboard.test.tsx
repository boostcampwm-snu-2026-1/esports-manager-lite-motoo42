import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { sampleOpponents } from "../../src/data/sampleOpponents";
import { createInitialCareer } from "../../src/domain/career/createInitialCareer";
import {
  activateWorlds,
  activateFirstStand,
  activateAsianGames,
  advanceFirstStandAfterCompletedMatches,
  advanceMsiAfterCompletedMatches,
  activateLckRounds34,
  activateLckRounds35,
  completeLckRounds34IfFinished,
  completeLckRounds35IfFinished,
  completeStoveLeague,
  createInitialLckStandings,
  createInitialSeasonState,
  createLckWorldsSeeds,
  createWorldsEntrants,
  firstStandStageNames,
  msiStageNames,
  recordCompletedMatches,
  setAsianGamesPlayMode,
  transitionFromLckRounds12ToMsi,
} from "../../src/domain/season";
import { advanceToNextDay } from "../../src/domain/season/progressSeason";
import { CompetitionDashboard } from "../../src/features/competition-dashboard";
import type {
  CareerSave,
  CompetitionState,
  MatchRecord,
  MatchSchedule,
  SeasonState,
  StandingEntry,
} from "../../src/types/game";

function createSeasonAfterLckCupFinal(base: CareerSave): SeasonState {
  return {
    ...base.seasonState,
    currentCompetitionId: "lck-cup",
    competitions: base.seasonState.competitions.map((competition) =>
      competition.competitionId === "lck-cup"
        ? {
            ...competition,
            status: "completed",
            currentStageName: "Completed",
            qualifiedTeamIds: ["gen-g", "t1"],
            qualifiedTeamNames: ["Gen.G", "T1"],
            winnerTeamId: "t1",
            winnerTeamName: "T1",
            completed: true,
          }
        : competition,
    ),
  };
}

function createCareerWithActiveLckCup(): CareerSave {
  const base = createInitialCareer("T1");

  return {
    ...base,
    seasonState: {
      ...completeStoveLeague(base.seasonState),
      offseason: undefined,
    },
  };
}

function getFirstStand(seasonState: SeasonState): CompetitionState {
  const competition = seasonState.competitions.find(
    (candidate) => candidate.competitionId === "first-stand",
  );

  if (!competition) {
    throw new Error("First Stand competition is missing.");
  }

  return competition;
}

function createBlueWinRecord(match: MatchSchedule, index: number): MatchRecord {
  const blueWins = match.format === "bo5" ? 3 : match.format === "bo3" ? 2 : 1;
  const redWins = match.format === "bo1" ? 0 : 1;

  return {
    id: `${match.id}-record-${index}`,
    scheduleId: match.id,
    competitionId: match.competitionId,
    week: match.week,
    stageName: match.stageName,
    winnerSide: "blue",
    winnerTeamId: match.blueTeamId,
    winnerTeamName: match.blueTeamName,
    score: { blueWins, redWins },
    userResult:
      match.blueTeamId === "t1"
        ? "win"
        : match.redTeamId === "t1"
          ? "loss"
          : "none",
    log: [`${match.blueTeamName} beat ${match.redTeamName}`],
    createdAtTurn: index + 1,
  };
}

function createCareerWithFirstStandFinal(): CareerSave {
  const base = createInitialCareer("T1");
  let season = activateFirstStand(createSeasonAfterLckCupFinal(base), sampleOpponents);
  let firstStand = getFirstStand(season);
  const groupMatches = firstStand.schedule.filter(
    (match) =>
      match.stageName === firstStandStageNames.groupA ||
      match.stageName === firstStandStageNames.groupB,
  );

  season = advanceFirstStandAfterCompletedMatches(
    recordCompletedMatches(season, groupMatches.map(createBlueWinRecord)),
  );
  firstStand = getFirstStand(season);

  const semifinals = firstStand.schedule.filter(
    (match) => match.stageName === firstStandStageNames.semifinals,
  );

  season = advanceFirstStandAfterCompletedMatches(
    recordCompletedMatches(season, semifinals.map(createBlueWinRecord)),
  );

  return { ...base, seasonState: season };
}

const firstStandTeamNames: Record<string, string> = {
  "first-stand-lpl-1": "Bilibili Gaming",
  t1: "T1",
};

function createMsiReadySeason(): SeasonState {
  const season = createInitialSeasonState({
    seasonNumber: 1,
    userTeamName: "T1",
  });
  const lckStandings = createInitialLckStandings("T1");

  return {
    ...season,
    phase: "competition",
    currentCompetitionId: "lck-rounds-1-2",
    competitions: season.competitions.map((competition) => {
      if (competition.competitionId === "first-stand") {
        return {
          ...competition,
          status: "completed",
          currentStageName: "Completed",
          standings: [
            {
              teamId: "first-stand-lpl-1",
              teamName: "Bilibili Gaming",
              rank: 1,
              initialSeed: 1,
              wins: 0,
              losses: 0,
              matchWins: 0,
              matchLosses: 0,
              setWins: 0,
              setLosses: 0,
              winRate: 0,
              isUserTeam: false,
            },
          ],
          qualifiedTeamIds: ["first-stand-lpl-1", "t1"],
          qualifiedTeamNames: ["Bilibili Gaming", "T1"],
          winnerTeamId: "first-stand-lpl-1",
          winnerTeamName: firstStandTeamNames["first-stand-lpl-1"],
          completed: true,
        };
      }

      if (competition.competitionId === "lck-rounds-1-2") {
        return {
          ...competition,
          status: "completed",
          currentStageName: "Playoffs Completed",
          standings: lckStandings,
          qualifiedTeamIds: ["t1", "gen-g"],
          qualifiedTeamNames: ["T1", "Gen.G"],
          winnerTeamId: "t1",
          winnerTeamName: "T1",
          completed: true,
        };
      }

      return competition;
    }),
  };
}

function createCarriedRounds12Standings(): StandingEntry[] {
  return createInitialLckStandings("T1").map((entry, index) => {
    const wins = 18 - index;
    const losses = index;
    const setWins = 36 - index;
    const setLosses = index;

    return {
      ...entry,
      rank: index + 1,
      initialSeed: index + 1,
      wins,
      losses,
      matchWins: wins,
      matchLosses: losses,
      setWins,
      setLosses,
      winRate: wins / (wins + losses),
    };
  });
}

function createCareerWithLckRounds34(): CareerSave {
  const base = createInitialCareer("T1");
  const seedSeason = createInitialSeasonState({
    seasonNumber: 1,
    userTeamName: "T1",
  });
  const season = activateLckRounds34({
    ...seedSeason,
    competitions: seedSeason.competitions.map((competition) =>
      competition.competitionId === "lck-rounds-1-2"
        ? {
            ...competition,
            status: "completed" as const,
            currentStageName: "Playoffs Completed",
            standings: createCarriedRounds12Standings(),
            completed: true,
          }
        : competition,
    ),
  });

  return { ...base, seasonState: season };
}

function createCareerWithLckRounds34Postseason(): CareerSave {
  const career = createCareerWithLckRounds34();
  const competition = career.seasonState.competitions.find(
    (candidate) => candidate.competitionId === "lck-rounds-3-4",
  );

  if (!competition) {
    throw new Error("LCK Rounds 3-4 competition is missing.");
  }

  const season = completeLckRounds34IfFinished(
    recordCompletedMatches(
      career.seasonState,
      competition.schedule.map(createBlueWinRecord),
    ),
  );

  return { ...career, seasonState: season };
}

function createCareerWithLckRounds35(): CareerSave {
  const base = createInitialCareer("T1");
  const seedSeason = createInitialSeasonState({
    seasonNumber: 2,
    userTeamName: "T1",
  });
  const season = activateLckRounds35({
    ...seedSeason,
    competitions: seedSeason.competitions.map((competition) =>
      competition.competitionId === "lck-rounds-1-2"
        ? {
            ...competition,
            status: "completed" as const,
            currentStageName: "Playoffs Completed",
            standings: createCarriedRounds12Standings(),
            completed: true,
          }
        : competition,
    ),
  });

  return { ...base, currentSeason: 2, seasonState: season };
}

function createCareerWithLckRounds35Postseason(): CareerSave {
  const career = createCareerWithLckRounds35();
  const competition = career.seasonState.competitions.find(
    (candidate) => candidate.competitionId === "lck-rounds-3-5",
  );

  if (!competition) {
    throw new Error("LCK Rounds 3-5 competition is missing.");
  }

  const season = completeLckRounds35IfFinished(
    recordCompletedMatches(
      career.seasonState,
      competition.schedule.map(createBlueWinRecord),
    ),
  );

  return { ...career, seasonState: season };
}

function createCareerWithWorldsQualification(): CareerSave {
  const career = createCareerWithLckRounds34Postseason();
  const lckRounds = career.seasonState.competitions.find(
    (candidate) => candidate.competitionId === "lck-rounds-3-4",
  );
  const finalTeamIds = lckRounds?.qualifiedTeamIds.slice(0, 4) ?? [
    "t1",
    "gen-g",
    "hle",
    "dk",
  ];
  const finalTeamNames = lckRounds?.qualifiedTeamNames.slice(0, 4) ?? [
    "T1",
    "Gen.G",
    "Hanwha Life Esports",
    "Dplus KIA",
  ];
  const lckSeeds = createLckWorldsSeeds(
    finalTeamIds.map((teamId, index) => ({
      teamId,
      teamName: finalTeamNames[index],
    })),
    ["LCK", "LPL"],
  );
  const entrants = createWorldsEntrants({
    bonusLeagueLabels: ["LCK", "LPL"],
    lckSeeds,
  });

  return {
    ...career,
    seasonState: {
      ...career.seasonState,
      worldsQualification: {
        status: "lck-seeds-decided",
        sourceCompetitionId: "msi",
        decidedAtDateKey: "2026-07-12",
        bonusLeagueLabels: ["LCK", "LPL"],
        msiLeagueResults: [
          {
            leagueLabel: "LCK",
            rank: 1,
            bestTeamId: "t1",
            bestTeamName: "T1",
            resultLabel: "MSI 우승",
            initialSeed: 1,
          },
          {
            leagueLabel: "LPL",
            rank: 3,
            bestTeamId: "msi-lpl-1",
            bestTeamName: "Bilibili Gaming",
            resultLabel: "Lower Final 탈락",
            initialSeed: 2,
          },
        ],
        lckSeeds,
        entrants,
        totalEntrants: entrants.length,
      },
    },
  };
}

function createCareerWithActiveWorlds(): CareerSave {
  const career = createCareerWithWorldsQualification();

  return {
    ...career,
    seasonState: activateWorlds({
      ...career.seasonState,
      currentCompetitionId: "asian-games",
      currentDateKey: "2026-09-20",
    }),
  };
}

function createCareerWithAsianGames(): CareerSave {
  const base = createInitialCareer("T1");
  const season = activateAsianGames(
    {
      ...base.seasonState,
      phase: "competition",
      currentCompetitionId: "lck-rounds-3-4",
      currentDateKey: "2026-08-24",
    },
    base.lckPlayers,
  );

  return {
    ...base,
    seasonState: setAsianGamesPlayMode(advanceToNextDay(season), "manual"),
  };
}

function getMsi(seasonState: SeasonState): CompetitionState {
  const competition = seasonState.competitions.find(
    (candidate) => candidate.competitionId === "msi",
  );

  if (!competition) {
    throw new Error("MSI competition is missing.");
  }

  return competition;
}

function createCareerWithMsiUpperRound1(): CareerSave {
  const base = createInitialCareer("T1");
  let season = transitionFromLckRounds12ToMsi(
    createMsiReadySeason(),
    sampleOpponents,
  );
  let msi = getMsi(season);
  const playInSemifinals = msi.schedule.filter(
    (match) => match.stageName === msiStageNames.playInSemifinals,
  );

  season = advanceMsiAfterCompletedMatches(
    recordCompletedMatches(season, playInSemifinals.map(createBlueWinRecord)),
  );
  msi = getMsi(season);

  const playInFinal = msi.schedule.filter(
    (match) => match.stageName === msiStageNames.playInFinal,
  );

  season = advanceMsiAfterCompletedMatches(
    recordCompletedMatches(season, playInFinal.map(createBlueWinRecord)),
  );

  return { ...base, seasonState: season };
}

describe("CompetitionDashboard", () => {
  it("renders a competition list hub and opens a selected competition", () => {
    const career = createInitialCareer("T1");
    const onSelectCompetition = vi.fn();

    render(
      <CompetitionDashboard
        career={career}
        competitionId={null}
        onSelectCompetition={onSelectCompetition}
      />,
    );

    expect(screen.getByRole("heading", { name: "대회 목록" })).toBeVisible();
    expect(screen.getAllByText("LCK 10개 팀").length).toBeGreaterThan(0);
    expect(screen.getByText(/Baron\/Elder 그룹 배틀/)).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /LCK Cup/ }));

    expect(onSelectCompetition).toHaveBeenCalledWith("lck-cup");
  });

  it("renders LCK Cup as a grouped tabbed dashboard", () => {
    const career = createCareerWithActiveLckCup();
    const onViewCalendar = vi.fn();

    render(
      <CompetitionDashboard
        career={career}
        competitionId="lck-cup"
        onViewCalendar={onViewCalendar}
      />,
    );

    expect(screen.getByRole("heading", { name: "LCK Cup" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "시즌 캘린더" }));
    expect(onViewCalendar).toHaveBeenCalledOnce();

    expect(screen.getByRole("button", { name: "순위표" })).toBeVisible();
    expect(screen.getByRole("button", { name: "그룹 포인트" })).toBeVisible();
    expect(screen.getByRole("button", { name: "일정" })).toBeVisible();
    expect(screen.getByRole("button", { name: "토너먼트" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "바론 그룹" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "장로 그룹" })).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "전체 순위표" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/pts \/ diff/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/Points/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "그룹 포인트" }));
    expect(
      screen.getByRole("heading", { name: "Baron / Elder 그룹 포인트" }),
    ).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "일정" }));
    expect(screen.getByRole("heading", { name: "일정 / 결과" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "바론 그룹" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "토너먼트" }));
    expect(
      screen.getByRole("heading", { name: "LCK Cup 토너먼트" }),
    ).toBeVisible();
  });

  it("renders live First Stand standings, schedule, and tournament data", () => {
    const career = createCareerWithFirstStandFinal();

    render(<CompetitionDashboard career={career} competitionId="first-stand" />);

    expect(screen.getByRole("heading", { name: "First Stand" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "참가팀" })).toBeVisible();
    expect(screen.getByText(/첫 국제전입니다/)).toBeVisible();
    expect(screen.getByText("Top Esports")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "조별 순위" }));
    expect(screen.getByRole("heading", { name: "조별 순위" })).toBeVisible();
    expect(screen.getAllByText("T1").length).toBeGreaterThan(0);
    expect(screen.getByText("Bilibili Gaming")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "일정" }));
    expect(screen.getByRole("heading", { name: "일정 / 결과" })).toBeVisible();
    expect(screen.getByText("T1 vs Top Esports")).toBeVisible();
    expect(screen.getAllByText("1-0").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "토너먼트" }));
    expect(
      screen.getByRole("heading", { name: "First Stand 토너먼트" }),
    ).toBeVisible();
    expect(screen.getByText("준결승 A")).toBeVisible();
    expect(screen.getAllByText("결승").length).toBeGreaterThan(0);
    expect(screen.getAllByText("T1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Gen.G").length).toBeGreaterThan(0);
    expect(screen.getAllByText("우승팀 미정").length).toBeGreaterThan(0);
    expect(screen.getByText("준결승 A 승자")).toBeVisible();
  });

  it("renders MSI overview, schedule, and upper/lower bracket data", () => {
    const career = createCareerWithMsiUpperRound1();

    render(<CompetitionDashboard career={career} competitionId="msi" />);

    expect(screen.getByRole("heading", { name: "MSI" })).toBeVisible();
    expect(screen.getByText("11팀")).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "MSI 참가팀과 토너먼트 진출" }),
    ).toBeVisible();
    expect(screen.getAllByText(/Worlds 추가 시드/).length).toBeGreaterThan(0);
    expect(screen.getByText("Bilibili Gaming")).toBeVisible();
    expect(screen.getAllByText("Gen.G").length).toBeGreaterThan(0);
    expect(screen.getAllByText("토너먼트 직행").length).toBeGreaterThan(0);
    expect(screen.getAllByText("플레이-인").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "일정" }));
    expect(screen.getByRole("heading", { name: "MSI 일정 / 결과" })).toBeVisible();
    expect(screen.getAllByText(/플레이-인 결승/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/승자조 1라운드/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/BO3/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "토너먼트" }));
    expect(screen.getByRole("heading", { name: "MSI 토너먼트" })).toBeVisible();
    expect(screen.getByText("승자조")).toBeVisible();
    expect(screen.getByText("패자조")).toBeVisible();
    expect(screen.getAllByText("최종 결승").length).toBeGreaterThan(0);
    expect(screen.getAllByText("BO5").length).toBeGreaterThan(0);
    expect(screen.getAllByText("우승팀 미정").length).toBeGreaterThan(0);
    expect(screen.getAllByText("T1").length).toBeGreaterThan(0);
  });

  it("renders LCK Rounds 3-4 groups and postseason path", () => {
    const career = createCareerWithLckRounds34();

    render(<CompetitionDashboard career={career} competitionId="lck-rounds-3-4" />);

    expect(screen.getByRole("heading", { name: "LCK Rounds 3-4" })).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "LCK Rounds 3-4 순위표" }),
    ).toBeVisible();
    expect(screen.getAllByText("Legend").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Rise").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "포스트시즌" }));
    expect(
      screen.getByRole("heading", { name: "LCK Rounds 3-4 포스트시즌" }),
    ).toBeVisible();
    expect(screen.getByText("2라운드 직행")).toBeVisible();
    expect(screen.getByText("시즌 플레이-인")).toBeVisible();
  });

  it("renders live LCK Rounds 3-4 Season Play-In and Worlds path candidates", () => {
    const career = createCareerWithLckRounds34Postseason();

    render(<CompetitionDashboard career={career} competitionId="lck-rounds-3-4" />);

    fireEvent.click(screen.getByRole("button", { name: "포스트시즌" }));

    expect(screen.getByText("실제 경기 진행 중 · 전 경기 BO5 Fearless")).toBeVisible();
    expect(screen.getByText("진출전 1")).toBeVisible();
    expect(screen.getByText("탈락전")).toBeVisible();
    expect(screen.getByText("최종 1-4위")).toBeVisible();
    expect(screen.getByText("MSI 추가 시드 조건부 4시드")).toBeVisible();
  });

  it("renders LCK Rounds 3-5 groups and postseason path", () => {
    const career = createCareerWithLckRounds35();

    render(<CompetitionDashboard career={career} competitionId="lck-rounds-3-5" />);

    expect(screen.getByRole("heading", { name: "LCK Rounds 3-5" })).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "LCK Rounds 3-5 순위표" }),
    ).toBeVisible();
    expect(screen.getAllByText("Legend").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Rise").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "포스트시즌" }));
    expect(
      screen.getByRole("heading", { name: "LCK Rounds 3-5 포스트시즌" }),
    ).toBeVisible();
    expect(screen.getByText("2라운드 직행")).toBeVisible();
    expect(screen.getByText("시즌 플레이-인")).toBeVisible();
  });

  it("renders live LCK Rounds 3-5 Season Play-In and Worlds path candidates", () => {
    const career = createCareerWithLckRounds35Postseason();

    render(<CompetitionDashboard career={career} competitionId="lck-rounds-3-5" />);

    fireEvent.click(screen.getByRole("button", { name: "포스트시즌" }));

    expect(screen.getByText("실제 경기 진행 중 · 전 경기 BO5 Fearless")).toBeVisible();
    expect(screen.getByText("진출전 1")).toBeVisible();
    expect(screen.getByText("탈락전")).toBeVisible();
    expect(screen.getByText("최종 1-4위")).toBeVisible();
    expect(screen.getByText("MSI 추가 시드 조건부 4시드")).toBeVisible();
  });

  it("renders LCK fourth seed as Worlds-qualified when MSI grants the LCK bonus", () => {
    const career = createCareerWithWorldsQualification();

    render(<CompetitionDashboard career={career} competitionId="lck-rounds-3-4" />);

    fireEvent.click(screen.getByRole("button", { name: "포스트시즌" }));

    expect(screen.getByText("Worlds 4시드 확정")).toBeVisible();
    expect(screen.getByText("1-3위 기본 진출 · 4위 MSI 추가 시드 확보")).toBeVisible();
  });

  it("renders the Worlds participant pool summary", () => {
    const career = createCareerWithWorldsQualification();

    render(<CompetitionDashboard career={career} competitionId="worlds" />);

    expect(screen.getByRole("heading", { name: "Worlds" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Worlds 참가 풀" })).toBeVisible();
    expect(screen.getByText("20팀")).toBeVisible();
    expect(screen.getByText("LCK 4시드 포함")).toBeVisible();
  });

  it("renders Worlds schedule, groups, and bracket tabs from actual Worlds state", () => {
    const career = createCareerWithActiveWorlds();
    const scheduleView = render(
      <CompetitionDashboard
        career={career}
        competitionId="worlds"
        subPage="schedule"
      />,
    );

    expect(screen.getByRole("heading", { name: "Worlds 일정 / 결과" })).toBeVisible();
    expect(screen.getAllByText(/플레이-인 A조/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/BO1/).length).toBeGreaterThan(0);
    scheduleView.unmount();

    const groupsView = render(
      <CompetitionDashboard
        career={career}
        competitionId="worlds"
        subPage="groups"
      />,
    );

    expect(screen.getByRole("heading", { name: "Worlds 조별 순위" })).toBeVisible();
    expect(screen.getByText("플레이-인 A")).toBeVisible();
    expect(screen.getByText("플레이-인 B")).toBeVisible();
    groupsView.unmount();

    render(
      <CompetitionDashboard
        career={career}
        competitionId="worlds"
        subPage="bracket"
      />,
    );

    expect(screen.getByRole("heading", { name: "Worlds 토너먼트" })).toBeVisible();
    expect(screen.getAllByText("8강").length).toBeGreaterThan(0);
    expect(screen.getByText("A1 vs B2")).toBeVisible();
    expect(screen.getByText("Worlds 우승팀")).toBeVisible();
  });

  it("renders Asian Games roster, schedule, and bracket tabs", () => {
    const career = createCareerWithAsianGames();

    render(<CompetitionDashboard career={career} competitionId="asian-games" />);

    expect(screen.getByRole("heading", { name: "Asian Games" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "대한민국 대표 6인" })).toBeVisible();
    expect(screen.getByText("Zeus")).toBeVisible();
    expect(screen.getAllByText("직접 플레이").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "일정" }));
    expect(
      screen.getByRole("heading", { name: "Asian Games 일정 / 결과" }),
    ).toBeVisible();
    expect(screen.getByText("대한민국 vs 마카오")).toBeVisible();
    expect(screen.getAllByText(/BO3/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "토너먼트" }));
    expect(screen.getByRole("heading", { name: "Asian Games 토너먼트" })).toBeVisible();
    expect(screen.getAllByText("8강").length).toBeGreaterThan(0);
    expect(screen.getAllByText("4강").length).toBeGreaterThan(0);
    expect(screen.getByText("결승 / 동메달전")).toBeVisible();
    expect(screen.getAllByText("미정").length).toBeGreaterThan(0);
  });

  it("renders controlled competition subpages from URL state", () => {
    const msiView = render(
      <CompetitionDashboard
        career={createCareerWithMsiUpperRound1()}
        competitionId="msi"
        subPage="bracket"
      />,
    );

    expect(screen.getByRole("heading", { name: "MSI 토너먼트" })).toBeVisible();
    msiView.unmount();

    const firstStandView = render(
      <CompetitionDashboard
        career={createCareerWithFirstStandFinal()}
        competitionId="first-stand"
        subPage="groups"
      />,
    );

    expect(screen.getByRole("heading", { name: "조별 순위" })).toBeVisible();
    firstStandView.unmount();

    const lckView = render(
      <CompetitionDashboard
        career={createCareerWithLckRounds34()}
        competitionId="lck-rounds-3-4"
        subPage="schedule"
      />,
    );

    expect(screen.getByRole("heading", { name: "일정 / 결과" })).toBeVisible();
    lckView.unmount();

    const lckCupView = render(
      <CompetitionDashboard
        career={createCareerWithActiveLckCup()}
        competitionId="lck-cup"
        subPage="schedule"
      />,
    );

    expect(screen.getByRole("heading", { name: "일정 / 결과" })).toBeVisible();
    lckCupView.unmount();

    const asianGamesView = render(
      <CompetitionDashboard
        career={createCareerWithAsianGames()}
        competitionId="asian-games"
        subPage="bracket"
      />,
    );

    expect(screen.getByRole("heading", { name: "Asian Games 토너먼트" })).toBeVisible();
    asianGamesView.unmount();

    render(
      <CompetitionDashboard
        career={createCareerWithActiveWorlds()}
        competitionId="worlds"
        subPage="bracket"
      />,
    );

    expect(screen.getByRole("heading", { name: "Worlds 토너먼트" })).toBeVisible();
  });

  it("emits subpage changes instead of mutating internal tabs when controlled", () => {
    const onSubPageChange = vi.fn();

    render(
      <CompetitionDashboard
        career={createCareerWithAsianGames()}
        competitionId="asian-games"
        subPage="overview"
        onSubPageChange={onSubPageChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "일정" }));

    expect(onSubPageChange).toHaveBeenCalledWith("schedule");
    expect(screen.getByRole("heading", { name: "대한민국 대표 6인" })).toBeVisible();
  });
});
