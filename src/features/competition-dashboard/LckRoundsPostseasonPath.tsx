import {
  getLckRounds34FinalPlacements,
  getLckRounds34PostseasonSeeds,
  getLckRounds35FinalPlacements,
  getLckRounds35PostseasonSeeds,
  isLckRounds34PostseasonStageName,
  isLckRounds35PostseasonStageName,
  lckRounds34PostseasonMatchIds,
  lckRounds35PostseasonMatchIds,
} from "../../domain/season";
import type {
  CompetitionState,
  MatchRecord,
  StandingEntry,
  WorldsQualificationState,
} from "../../types/game";
import {
  compareStandingEntries,
  getLckRoundsFormatTitle,
  getRecordByScheduleId,
  isLckRounds35Competition,
} from "./competitionDashboardShared";
import {
  LckPlayoffMatchCard,
  createSlotFromMatchSide,
  createWinnerSlot,
  getPlayoffMatch,
  type LckPlayoffMatch,
  type LckPlayoffSlot,
} from "./lckDashboardShared";

function createLckRounds34PathSlot({
  detail,
  entry,
  label,
}: {
  detail: string;
  entry: StandingEntry | undefined;
  label: string;
}): LckPlayoffSlot {
  return {
    label,
    teamId: entry?.teamId,
    teamName: entry?.teamName ?? label,
    detail,
    isPlaceholder: !entry,
  };
}

function createLckRounds34TeamSlot({
  detail,
  label,
  team,
}: {
  detail: string;
  label: string;
  team: { teamId: string; teamName: string } | undefined;
}): LckPlayoffSlot {
  return {
    label,
    teamId: team?.teamId,
    teamName: team?.teamName ?? label,
    detail,
    isPlaceholder: !team,
  };
}

function getLckRounds34ProjectedPathGroups(table: StandingEntry[]) {
  const legendStandings = table
    .filter((entry) => entry.lckRoundsGroup === "legend")
    .sort(compareStandingEntries);
  const riseStandings = table
    .filter((entry) => entry.lckRoundsGroup === "rise")
    .sort(compareStandingEntries);

  return [
    {
      id: "playoffs-round-2",
      title: "Playoffs R2",
      matches: [
        {
          id: "lck-r34-path-r2",
          stageName: "Playoffs Round 2",
          title: "Round 2 직행",
          subtitle: "Legend 1-2위",
          slots: [
            createLckRounds34PathSlot({
              detail: "Legend Group 1위",
              entry: legendStandings[0],
              label: "Legend 1위",
            }),
            createLckRounds34PathSlot({
              detail: "Legend Group 2위",
              entry: legendStandings[1],
              label: "Legend 2위",
            }),
          ],
        },
      ] satisfies LckPlayoffMatch[],
    },
    {
      id: "playoffs-round-1",
      title: "Playoffs R1",
      matches: [
        {
          id: "lck-r34-path-r1",
          stageName: "Playoffs Round 1",
          title: "Round 1 직행",
          subtitle: "Legend 3-4위",
          slots: [
            createLckRounds34PathSlot({
              detail: "Legend Group 3위",
              entry: legendStandings[2],
              label: "Legend 3위",
            }),
            createLckRounds34PathSlot({
              detail: "Legend Group 4위",
              entry: legendStandings[3],
              label: "Legend 4위",
            }),
          ],
        },
      ] satisfies LckPlayoffMatch[],
    },
    {
      id: "season-play-in",
      title: "Season Play-In",
      matches: [
        {
          id: "lck-r34-path-play-in",
          stageName: "Season Play-In",
          title: "Play-In 후보",
          subtitle: "Legend 5위 + Rise 1-3위",
          slots: [
            createLckRounds34PathSlot({
              detail: "Legend Group 5위",
              entry: legendStandings[4],
              label: "Legend 5위",
            }),
            createLckRounds34PathSlot({
              detail: "Rise Group 1위",
              entry: riseStandings[0],
              label: "Rise 1위",
            }),
            createLckRounds34PathSlot({
              detail: "Rise Group 2위",
              entry: riseStandings[1],
              label: "Rise 2위",
            }),
            createLckRounds34PathSlot({
              detail: "Rise Group 3위",
              entry: riseStandings[2],
              label: "Rise 3위",
            }),
          ],
        },
      ] satisfies LckPlayoffMatch[],
    },
    {
      id: "season-locked",
      title: "Final Rank",
      matches: [
        {
          id: "lck-r34-path-out",
          stageName: "Season Final Rank",
          title: "9-10위 확정",
          subtitle: "Rise 4-5위",
          slots: [
            createLckRounds34PathSlot({
              detail: "Rise Group 4위",
              entry: riseStandings[3],
              label: "Rise 4위",
            }),
            createLckRounds34PathSlot({
              detail: "Rise Group 5위",
              entry: riseStandings[4],
              label: "Rise 5위",
            }),
          ],
        },
      ] satisfies LckPlayoffMatch[],
    },
  ];
}

function getLckRounds34SeedSlots(competition: CompetitionState) {
  const seeds = isLckRounds35Competition(competition)
    ? getLckRounds35PostseasonSeeds(competition)
    : getLckRounds34PostseasonSeeds(competition);

  return Array.from({ length: 8 }, (_, index) => {
    const seed = seeds[index];
    const label =
      index < 5 ? `Legend ${index + 1}위` : `Rise ${index - 4}위`;

    return createLckRounds34TeamSlot({
      detail: seed?.sourceDetail ?? "정규 그룹 종료 후 확정",
      label,
      team: seed,
    });
  });
}

function createLckRounds34MatchCard({
  competition,
  fallbackSlots,
  recordsByScheduleId,
  scheduleId,
  slotLabels,
  subtitle,
  title,
}: {
  competition: CompetitionState;
  fallbackSlots: LckPlayoffSlot[];
  recordsByScheduleId: Map<string, MatchRecord>;
  scheduleId: string;
  slotLabels: [string, string];
  subtitle: string;
  title: string;
}): LckPlayoffMatch {
  const match = getPlayoffMatch(competition, scheduleId);

  return {
    id: scheduleId,
    stageName: match?.stageName ?? "Pending",
    title,
    subtitle,
    slots: match
      ? [
          createSlotFromMatchSide({
            label: slotLabels[0],
            match,
            record: recordsByScheduleId.get(match.id),
            side: "blue",
          }),
          createSlotFromMatchSide({
            label: slotLabels[1],
            match,
            record: recordsByScheduleId.get(match.id),
            side: "red",
          }),
        ]
      : fallbackSlots,
  };
}

function getLckRounds34FinalPlacementSlots({
  competition,
  records,
  worldsQualification,
}: {
  competition: CompetitionState;
  records: MatchRecord[];
  worldsQualification: WorldsQualificationState | undefined;
}) {
  const placements = isLckRounds35Competition(competition)
    ? getLckRounds35FinalPlacements(competition, records)
    : getLckRounds34FinalPlacements(competition, records);
  const fallbackPlacements =
    placements.length >= 4
      ? placements
      : competition.qualifiedTeamIds.slice(0, 4).map((teamId, index) => ({
          teamId,
          teamName: competition.qualifiedTeamNames[index] ?? `최종 ${index + 1}위`,
        }));
  const fourthSeed = worldsQualification?.lckSeeds.find((seed) => seed.seed === 4);
  const fourthSeedDetail = !worldsQualification
    ? "MSI 추가 시드 조건부 4시드"
    : fourthSeed?.status === "qualified"
      ? worldsQualification.status === "lck-seeds-decided"
        ? "Worlds 4시드 확정"
        : "MSI 추가 시드 확보"
      : "MSI 추가 시드 조건 미충족";

  return [
    createLckRounds34TeamSlot({
      detail: "Worlds 기본 진출권",
      label: "최종 1위",
      team: fallbackPlacements[0],
    }),
    createLckRounds34TeamSlot({
      detail: "Worlds 기본 진출권",
      label: "최종 2위",
      team: fallbackPlacements[1],
    }),
    createLckRounds34TeamSlot({
      detail: "Worlds 기본 진출권",
      label: "최종 3위",
      team: fallbackPlacements[2],
    }),
    createLckRounds34TeamSlot({
      detail: fourthSeedDetail,
      label: "최종 4위",
      team: fallbackPlacements[3],
    }),
  ];
}

function getLckRounds34ActualPostseasonGroups({
  competition,
  records,
  worldsQualification,
}: {
  competition: CompetitionState;
  records: MatchRecord[];
  worldsQualification: WorldsQualificationState | undefined;
}) {
  const recordsByScheduleId = getRecordByScheduleId(records);
  const seedSlots = getLckRounds34SeedSlots(competition);
  const matchIds = isLckRounds35Competition(competition)
    ? lckRounds35PostseasonMatchIds
    : lckRounds34PostseasonMatchIds;

  return [
    {
      id: "season-play-in",
      title: "Season Play-In",
      matches: [
        createLckRounds34MatchCard({
          competition,
          fallbackSlots: [seedSlots[4], seedSlots[5]],
          recordsByScheduleId,
          scheduleId: matchIds.playInFirstQualifier,
          slotLabels: ["Legend 5위", "Rise 1위"],
          subtitle: "BO5 · 승자는 Playoffs 진출",
          title: "Qualifier 1",
        }),
        createLckRounds34MatchCard({
          competition,
          fallbackSlots: [seedSlots[6], seedSlots[7]],
          recordsByScheduleId,
          scheduleId: matchIds.playInElimination,
          slotLabels: ["Rise 2위", "Rise 3위"],
          subtitle: "BO5 · 승자는 최종 진출전",
          title: "Elimination",
        }),
        createLckRounds34MatchCard({
          competition,
          fallbackSlots: [
            createWinnerSlot("Qualifier 1 패자"),
            createWinnerSlot("Elimination 승자"),
          ],
          recordsByScheduleId,
          scheduleId: matchIds.playInSecondQualifier,
          slotLabels: ["Qualifier 1 패자", "Elimination 승자"],
          subtitle: "BO5 · 승자는 Playoffs 마지막 자리",
          title: "Qualifier 2",
        }),
      ] satisfies LckPlayoffMatch[],
    },
    {
      id: "playoffs-round-1",
      title: "Playoffs R1",
      matches: [
        createLckRounds34MatchCard({
          competition,
          fallbackSlots: [seedSlots[2], createWinnerSlot("Play-In 2번")],
          recordsByScheduleId,
          scheduleId: matchIds.playoffsRound1Legend3VsPlayIn2,
          slotLabels: ["Legend 3위", "Play-In 2번"],
          subtitle: "BO5 · 패자는 하위조",
          title: "R1 Match A",
        }),
        createLckRounds34MatchCard({
          competition,
          fallbackSlots: [seedSlots[3], createWinnerSlot("Play-In 1번")],
          recordsByScheduleId,
          scheduleId: matchIds.playoffsRound1Legend4VsPlayIn1,
          slotLabels: ["Legend 4위", "Play-In 1번"],
          subtitle: "BO5 · 패자는 하위조",
          title: "R1 Match B",
        }),
      ] satisfies LckPlayoffMatch[],
    },
    {
      id: "playoffs-round-2",
      title: "Playoffs R2",
      matches: [
        createLckRounds34MatchCard({
          competition,
          fallbackSlots: [seedSlots[0], createWinnerSlot("R1 Match B 승자")],
          recordsByScheduleId,
          scheduleId: matchIds.playoffsRound2Legend1VsRound1B,
          slotLabels: ["Legend 1위", "R1 Match B 승자"],
          subtitle: "BO5 · 승자는 Playoffs R3",
          title: "R2 Match A",
        }),
        createLckRounds34MatchCard({
          competition,
          fallbackSlots: [seedSlots[1], createWinnerSlot("R1 Match A 승자")],
          recordsByScheduleId,
          scheduleId: matchIds.playoffsRound2Legend2VsRound1A,
          slotLabels: ["Legend 2위", "R1 Match A 승자"],
          subtitle: "BO5 · 승자는 Playoffs R3",
          title: "R2 Match B",
        }),
      ] satisfies LckPlayoffMatch[],
    },
    {
      id: "lower-round-1",
      title: "Lower R1",
      matches: [
        createLckRounds34MatchCard({
          competition,
          fallbackSlots: [
            createWinnerSlot("R2 Match A 패자"),
            createWinnerSlot("R1 Match A 패자"),
          ],
          recordsByScheduleId,
          scheduleId: matchIds.lowerRound1A,
          slotLabels: ["R2 Match A 패자", "R1 Match A 패자"],
          subtitle: "BO5 · 패자는 탈락",
          title: "Lower Match A",
        }),
        createLckRounds34MatchCard({
          competition,
          fallbackSlots: [
            createWinnerSlot("R2 Match B 패자"),
            createWinnerSlot("R1 Match B 패자"),
          ],
          recordsByScheduleId,
          scheduleId: matchIds.lowerRound1B,
          slotLabels: ["R2 Match B 패자", "R1 Match B 패자"],
          subtitle: "BO5 · 패자는 탈락",
          title: "Lower Match B",
        }),
      ] satisfies LckPlayoffMatch[],
    },
    {
      id: "playoffs-round-3",
      title: "Playoffs R3",
      matches: [
        createLckRounds34MatchCard({
          competition,
          fallbackSlots: [
            createWinnerSlot("R2 Match A 승자"),
            createWinnerSlot("R2 Match B 승자"),
          ],
          recordsByScheduleId,
          scheduleId: matchIds.playoffsRound3,
          slotLabels: ["R2 Match A 승자", "R2 Match B 승자"],
          subtitle: "BO5 · 승자는 Grand Final",
          title: "Upper Final",
        }),
      ] satisfies LckPlayoffMatch[],
    },
    {
      id: "lower-round-2",
      title: "Lower R2",
      matches: [
        createLckRounds34MatchCard({
          competition,
          fallbackSlots: [
            createWinnerSlot("Lower Match A 승자"),
            createWinnerSlot("Lower Match B 승자"),
          ],
          recordsByScheduleId,
          scheduleId: matchIds.lowerRound2,
          slotLabels: ["Lower Match A 승자", "Lower Match B 승자"],
          subtitle: "BO5 · 패자는 최종 4위",
          title: "Lower Semifinal",
        }),
      ] satisfies LckPlayoffMatch[],
    },
    {
      id: "finals",
      title: "Finals",
      matches: [
        createLckRounds34MatchCard({
          competition,
          fallbackSlots: [
            createWinnerSlot("Upper Final 패자"),
            createWinnerSlot("Lower Semifinal 승자"),
          ],
          recordsByScheduleId,
          scheduleId: matchIds.lowerFinal,
          slotLabels: ["Upper Final 패자", "Lower Semifinal 승자"],
          subtitle: "BO5 · 패자는 최종 3위",
          title: "Lower Final",
        }),
        createLckRounds34MatchCard({
          competition,
          fallbackSlots: [
            createWinnerSlot("Upper Final 승자"),
            createWinnerSlot("Lower Final 승자"),
          ],
          recordsByScheduleId,
          scheduleId: matchIds.grandFinal,
          slotLabels: ["Upper Final 승자", "Lower Final 승자"],
          subtitle: "BO5 · 우승 결정전",
          title: "Grand Final",
        }),
      ] satisfies LckPlayoffMatch[],
    },
    {
      id: "worlds-path",
      title: "Worlds Path",
      matches: [
        {
          id: "lck-r34-worlds-candidates",
          stageName: "Worlds Qualification",
          title: "최종 1-4위",
          subtitle:
            worldsQualification?.bonusLeagueLabels.includes("LCK")
              ? "1-3위 기본 진출 · 4위 MSI 추가 시드 확보"
              : "1-3위 기본 진출 · 4위 MSI 추가 시드 조건 미충족",
          slots: getLckRounds34FinalPlacementSlots({
            competition,
            records,
            worldsQualification,
          }),
        },
      ] satisfies LckPlayoffMatch[],
    },
  ];
}

export function LckRounds34PostseasonPathView({
  competition,
  records,
  table,
  userTeamId,
  worldsQualification,
}: {
  competition: CompetitionState;
  records: MatchRecord[];
  table: StandingEntry[];
  userTeamId: string | undefined;
  worldsQualification: WorldsQualificationState | undefined;
}) {
  const hasPostseasonSchedule = competition.schedule.some((match) =>
    isLckRounds35Competition(competition)
      ? isLckRounds35PostseasonStageName(match.stageName)
      : isLckRounds34PostseasonStageName(match.stageName),
  );
  const pathGroups = hasPostseasonSchedule
    ? getLckRounds34ActualPostseasonGroups({
        competition,
        records,
        worldsQualification,
      })
    : getLckRounds34ProjectedPathGroups(table);
  const currentPostseasonStageName =
    (isLckRounds35Competition(competition)
      ? isLckRounds35PostseasonStageName(competition.currentStageName)
      : isLckRounds34PostseasonStageName(competition.currentStageName))
      ? competition.currentStageName
      : null;
  const bracketStatus = competition.completed
    ? worldsQualification?.bonusLeagueLabels.includes("LCK")
      ? "최종 1~4위 저장 완료 · LCK 4시드 Worlds 확정"
      : "최종 1~4위 저장 완료 · 4위는 조건 미충족"
    : hasPostseasonSchedule
      ? "실제 경기 진행 중 · 전 경기 BO5 Fearless"
      : "현 순위 기준 예상 슬롯";

  return (
    <section className="competition-panel lck-rounds-main-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Postseason Path</p>
          <h2>{getLckRoundsFormatTitle(competition)} 후속 경로</h2>
        </div>
        <span className="panel-note">{bracketStatus}</span>
      </div>
      <div className="lck-playoff-frame">
        <div className="lck-playoff-bracket">
          {pathGroups.map((round) => (
            <section
              className={`lck-playoff-round ${
                round.matches.some(
                  (match) => match.stageName === currentPostseasonStageName,
                )
                  ? "lck-playoff-round-current"
                  : ""
              }`}
              key={round.id}
            >
              <h3>{round.title}</h3>
              <div className="lck-playoff-match-stack">
                {round.matches.map((match) => (
                  <LckPlayoffMatchCard
                    isCurrent={match.stageName === currentPostseasonStageName}
                    key={match.id}
                    match={match}
                    userTeamId={userTeamId}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
