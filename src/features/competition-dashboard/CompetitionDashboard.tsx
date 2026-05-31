import { useState } from "react";
import {
  getLckCupGroupBattleTable,
  getLckCupGroupPointSummary,
  getLckCupStageNames,
} from "../../domain/season";
import type {
  CareerSave,
  CompetitionId,
  CompetitionState,
  LckCupGroupName,
  MatchRecord,
  MatchSchedule,
  StandingEntry,
} from "../../types/game";

type CompetitionDashboardProps = {
  career: CareerSave;
  competitionId?: CompetitionId | null;
};

type LckRoundsDashboardTab = "standings" | "schedule" | "tournament";

type LckPlayoffSlot = {
  label: string;
  teamId?: string;
  teamName: string;
  detail: string;
  isPlaceholder: boolean;
};

type LckPlayoffMatch = {
  id: string;
  title: string;
  subtitle: string;
  slots: LckPlayoffSlot[];
};

const lckCupStageNames = getLckCupStageNames();
const knockoutRounds = [
  {
    id: "play-in-r1",
    title: "Play-In R1",
    stageName: lckCupStageNames.playInRound1,
    slots: 2,
  },
  {
    id: "play-in-r2",
    title: "Play-In R2",
    stageName: lckCupStageNames.playInRound2,
    slots: 2,
  },
  {
    id: "wildcard",
    title: "Wildcard",
    stageName: lckCupStageNames.playoffsWildcard,
    slots: 1,
  },
  {
    id: "semifinals",
    title: "Semifinals",
    stageName: lckCupStageNames.playoffsSemifinals,
    slots: 2,
  },
  {
    id: "finals",
    title: "Final",
    stageName: lckCupStageNames.finals,
    slots: 1,
  },
];

function getCurrentCompetition(
  career: CareerSave,
  competitionId?: CompetitionId | null,
) {
  const targetCompetitionId =
    competitionId ?? career.seasonState.currentCompetitionId;

  return career.seasonState.competitions.find(
    (competition) => competition.competitionId === targetCompetitionId,
  );
}

function getUserTeamId(competition: CompetitionState | undefined) {
  return competition?.standings.find((entry) => entry.isUserTeam)?.teamId;
}

function getGroupLabel(group: LckCupGroupName | undefined) {
  if (!group) {
    return "-";
  }

  return group === "baron" ? "Baron" : "Elder";
}

function getSetDiff(entry: StandingEntry) {
  const diff = entry.setWins - entry.setLosses;

  return `${diff > 0 ? "+" : ""}${diff}`;
}

function getMatchCount(entry: StandingEntry) {
  return entry.wins + entry.losses;
}

function getDateLabel(dateKey: string | undefined) {
  if (!dateKey) {
    return "날짜 미정";
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];

  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")} (${weekdayLabels[date.getDay()]})`;
}

function getMatchRecord(
  match: MatchSchedule,
  records: MatchRecord[],
): MatchRecord | undefined {
  return records.find((record) => record.scheduleId === match.id);
}

function getScoreLabel(record: MatchRecord | undefined) {
  if (!record) {
    return "예정";
  }

  return `${record.score.blueWins}-${record.score.redWins}`;
}

function getMatchTitle(match: MatchSchedule) {
  return `${match.blueTeamName} vs ${match.redTeamName}`;
}

function getFormatLabel(match: MatchSchedule) {
  return `${match.format.toUpperCase()}${match.fearlessEnabled ? " · Fearless" : ""}`;
}

function getSortedTable(competition: CompetitionState, records: MatchRecord[]) {
  if (competition.competitionId === "lck-cup") {
    return getLckCupGroupBattleTable(competition, records);
  }

  return [...competition.standings].sort((left, right) => {
    const winDiff = right.wins - left.wins;

    if (winDiff !== 0) {
      return winDiff;
    }

    const setDiffLeft = left.setWins - left.setLosses;
    const setDiffRight = right.setWins - right.setLosses;
    const setDiff = setDiffRight - setDiffLeft;

    if (setDiff !== 0) {
      return setDiff;
    }

    return left.initialSeed - right.initialSeed;
  });
}

function getNextWeekMatches(competition: CompetitionState) {
  const nextMatch = [...competition.schedule]
    .filter((match) => match.status === "scheduled")
    .sort((left, right) => left.week - right.week)[0];

  if (!nextMatch) {
    return [];
  }

  return competition.schedule.filter(
    (match) =>
      match.status === "scheduled" &&
      match.week === nextMatch.week &&
      match.competitionId === competition.competitionId,
  );
}

function getCurrentWeekMatches(competition: CompetitionState) {
  return competition.schedule.filter((match) => match.week === competition.currentWeek);
}

function getRecentRecords(
  competition: CompetitionState,
  records: MatchRecord[],
) {
  return records
    .filter((record) => record.competitionId === competition.competitionId)
    .slice(-5)
    .reverse();
}

function getNextUserMatch(
  competition: CompetitionState,
  userTeamId: string | undefined,
) {
  return [...competition.schedule]
    .filter(
      (match) =>
        match.status === "scheduled" &&
        (match.blueTeamId === userTeamId || match.redTeamId === userTeamId),
    )
    .sort((left, right) => {
      const dateDiff = (left.scheduledDate ?? "").localeCompare(
        right.scheduledDate ?? "",
      );

      return dateDiff !== 0 ? dateDiff : left.id.localeCompare(right.id);
    })[0];
}

function getRecentUserRecord({
  competition,
  records,
  userTeamId,
}: {
  competition: CompetitionState;
  records: MatchRecord[];
  userTeamId: string | undefined;
}) {
  const scheduleById = new Map(competition.schedule.map((match) => [match.id, match]));

  return [...records]
    .filter((record) => record.competitionId === competition.competitionId)
    .reverse()
    .find((record) => {
      const match = scheduleById.get(record.scheduleId);

      return (
        match &&
        (match.blueTeamId === userTeamId || match.redTeamId === userTeamId)
      );
    });
}

function getUserResultLabel(record: MatchRecord | undefined) {
  if (!record) {
    return "결과 없음";
  }

  if (record.userResult === "win") {
    return "승리";
  }

  if (record.userResult === "loss") {
    return "패배";
  }

  return "중립";
}

function getRemainingSeriesByTeamId(competition: CompetitionState) {
  const remainingSeriesByTeamId = new Map(
    competition.standings.map((entry) => [entry.teamId, 0]),
  );

  competition.schedule.forEach((match) => {
    if (match.status !== "scheduled") {
      return;
    }

    remainingSeriesByTeamId.set(
      match.blueTeamId,
      (remainingSeriesByTeamId.get(match.blueTeamId) ?? 0) + 1,
    );
    remainingSeriesByTeamId.set(
      match.redTeamId,
      (remainingSeriesByTeamId.get(match.redTeamId) ?? 0) + 1,
    );
  });

  return remainingSeriesByTeamId;
}

function getPlayoffClinchedTeamIds(competition: CompetitionState, playoffSlots = 6) {
  if (competition.completed && competition.qualifiedTeamIds.length > 0) {
    return new Set(competition.qualifiedTeamIds.slice(0, playoffSlots));
  }

  const remainingSeriesByTeamId = getRemainingSeriesByTeamId(competition);

  return new Set(
    competition.standings
      .filter((entry) => {
        const teamsThatCanStillReachEntry = competition.standings.filter(
          (otherEntry) => {
            if (otherEntry.teamId === entry.teamId) {
              return true;
            }

            const maxPossibleWins =
              otherEntry.wins +
              (remainingSeriesByTeamId.get(otherEntry.teamId) ?? 0);

            return maxPossibleWins >= entry.wins;
          },
        ).length;

        return teamsThatCanStillReachEntry <= playoffSlots;
      })
      .map((entry) => entry.teamId),
  );
}

function getUserMatchResult({
  match,
  record,
  userTeamId,
}: {
  match: MatchSchedule;
  record: MatchRecord | undefined;
  userTeamId: string | undefined;
}) {
  if (
    !record ||
    !userTeamId ||
    (match.blueTeamId !== userTeamId && match.redTeamId !== userTeamId)
  ) {
    return "neutral";
  }

  const userScore =
    match.blueTeamId === userTeamId
      ? record.score.blueWins
      : record.score.redWins;
  const opponentScore =
    match.blueTeamId === userTeamId
      ? record.score.redWins
      : record.score.blueWins;

  return userScore > opponentScore ? "win" : "loss";
}

function getScheduleStatusClass({
  match,
  record,
  userTeamId,
}: {
  match: MatchSchedule;
  record: MatchRecord | undefined;
  userTeamId: string | undefined;
}) {
  if (!record) {
    return "schedule-status-scheduled";
  }

  const userResult = getUserMatchResult({ match, record, userTeamId });

  if (userResult === "win") {
    return "schedule-status-user-win";
  }

  if (userResult === "loss") {
    return "schedule-status-user-loss";
  }

  return "schedule-status-neutral";
}

function getLckRoundsSeedSlots(
  competition: CompetitionState,
  table: StandingEntry[],
) {
  const qualifierIds = competition.qualifiedTeamIds;
  const qualifierNames = competition.qualifiedTeamNames;
  const hasConfirmedSeeds = competition.completed && qualifierIds.length >= 6;

  return Array.from({ length: 6 }, (_, index) => {
    const seed = index + 1;

    if (hasConfirmedSeeds) {
      const teamId = qualifierIds[index];
      const tableEntry = table.find((entry) => entry.teamId === teamId);
      const teamName = tableEntry?.teamName ?? qualifierNames[index] ?? `LCK ${seed}위`;

      return {
        label: `${seed}번 시드`,
        teamId,
        teamName,
        detail: `LCK ${seed}위`,
        isPlaceholder: false,
      };
    }

    return {
      label: `LCK ${seed}위`,
      teamName: `LCK ${seed}위`,
      detail: "정규시즌 종료 후 확정",
      isPlaceholder: true,
    };
  });
}

function createWinnerSlot(label: string): LckPlayoffSlot {
  return {
    label,
    teamName: label,
    detail: "이전 라운드 승자",
    isPlaceholder: true,
  };
}

function getLckRoundsPlayoffMatches({
  competition,
  table,
}: {
  competition: CompetitionState;
  table: StandingEntry[];
}) {
  const seedSlots = getLckRoundsSeedSlots(competition, table);

  return [
    {
      id: "round-1",
      title: "Round 1",
      matches: [
        {
          id: "r1-a",
          title: "R1 Match A",
          subtitle: "BO5 · 3위 vs 6위",
          slots: [seedSlots[2], seedSlots[5]],
        },
        {
          id: "r1-b",
          title: "R1 Match B",
          subtitle: "BO5 · 4위 vs 5위",
          slots: [seedSlots[3], seedSlots[4]],
        },
      ] satisfies LckPlayoffMatch[],
    },
    {
      id: "semifinals",
      title: "Semifinals",
      matches: [
        {
          id: "sf-a",
          title: "Semifinal A",
          subtitle: "BO5 · 1위 합류",
          slots: [seedSlots[0], createWinnerSlot("R1 Match A 승자")],
        },
        {
          id: "sf-b",
          title: "Semifinal B",
          subtitle: "BO5 · 2위 합류",
          slots: [seedSlots[1], createWinnerSlot("R1 Match B 승자")],
        },
      ] satisfies LckPlayoffMatch[],
    },
    {
      id: "final",
      title: "Final",
      matches: [
        {
          id: "final-a",
          title: "Final",
          subtitle: "BO5 · 우승 결정전",
          slots: [
            createWinnerSlot("Semifinal A 승자"),
            createWinnerSlot("Semifinal B 승자"),
          ],
        },
      ] satisfies LckPlayoffMatch[],
    },
  ];
}

function getStatusText(competition: CompetitionState) {
  if (competition.completed) {
    return "Completed";
  }

  if (competition.status === "active") {
    return competition.currentStageName;
  }

  return competition.status;
}

function getRecordByScheduleId(records: MatchRecord[]) {
  return new Map(records.map((record) => [record.scheduleId, record]));
}

function getTeamClass({
  teamId,
  record,
  userTeamId,
}: {
  teamId: string;
  record: MatchRecord | undefined;
  userTeamId: string | undefined;
}) {
  const classes = ["bracket-team"];

  if (teamId === userTeamId) {
    classes.push("bracket-team-user");
  }

  if (record?.winnerTeamId === teamId) {
    classes.push("bracket-team-winner");
  }

  return classes.join(" ");
}

function CompetitionSummary({
  career,
  competition,
  userTeamId,
}: {
  career: CareerSave;
  competition: CompetitionState;
  userTeamId: string | undefined;
}) {
  const nextMatches = getNextWeekMatches(competition);
  const userStanding = competition.standings.find(
    (entry) => entry.teamId === userTeamId,
  );

  return (
    <section className="competition-summary-grid">
      <article className="competition-summary-card">
        <p className="eyebrow">Competition</p>
        <h1>{competition.name}</h1>
        <span>{career.seasonState.currentDateLabel}</span>
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">Stage</p>
        <strong>{getStatusText(competition)}</strong>
        <span>{competition.currentWeek}주차</span>
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">User team</p>
        <strong>
          {userStanding?.teamName ?? career.userTeam.name} · {career.userTeam.wins}W{" "}
          {career.userTeam.losses}L
        </strong>
        <span>현재 대회 기준 성적을 추적합니다.</span>
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">Next</p>
        <strong>
          {nextMatches[0] ? `${nextMatches[0].week}주차` : "예정 경기 없음"}
        </strong>
        <span>
          {nextMatches[0]
            ? `${nextMatches.length}개 시리즈 대기 중`
            : "다음 단계 연결을 기다리는 중입니다."}
        </span>
      </article>
    </section>
  );
}

function LckRoundsSummary({
  career,
  competition,
}: {
  career: CareerSave;
  competition: CompetitionState;
}) {
  const [showFormatRules, setShowFormatRules] = useState(false);

  return (
    <section className="competition-summary-grid competition-summary-grid-compact">
      <article className="competition-summary-card competition-summary-card-wide">
        <p className="eyebrow">Competition</p>
        <h1>{competition.name}</h1>
        <span>{career.seasonState.currentDateLabel}</span>
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">Stage</p>
        <strong>{getStatusText(competition)}</strong>
        <span>{competition.currentWeek}주차</span>
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">Format</p>
        <button
          className="format-summary-button"
          onClick={() => setShowFormatRules(true)}
          type="button"
        >
          <strong>LCK Rounds 1-2</strong>
          <span>대회 포맷 상세 보기</span>
        </button>
      </article>
      {showFormatRules && (
        <LckRoundsFormatModal onClose={() => setShowFormatRules(false)} />
      )}
    </section>
  );
}

function LckRoundsFormatModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        aria-labelledby="lck-rounds-format-title"
        aria-modal="true"
        className="competition-rules-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button
          aria-label="닫기"
          className="modal-close-button"
          onClick={onClose}
          type="button"
        >
          x
        </button>
        <p className="eyebrow">Competition Regulations</p>
        <h2 id="lck-rounds-format-title">LCK Rounds 1-2</h2>
        <div className="competition-rules-list">
          <article>
            <strong>제1조 참가팀</strong>
            <p>LCK 소속 10팀이 동일한 정규시즌 테이블에서 경쟁한다.</p>
          </article>
          <article>
            <strong>제2조 경기 방식</strong>
            <p>
              각 팀은 9주 동안 총 18시리즈를 치른다. 모든 경기는 BO3
              시리즈 단위로 기록하며, 시스템 내 AI 경기 역시 동일하게 처리한다.
            </p>
          </article>
          <article>
            <strong>제3조 순위 산정</strong>
            <p>
              순위는 승수, 세트 득실, 세트 승수, 초기 시드순으로 산정한다.
              별도 타이브레이커 경기는 1차 구현 범위에서 제외한다.
            </p>
          </article>
          <article>
            <strong>제4조 포스트시즌 진출</strong>
            <p>
              정규시즌 종료 시 상위 6팀이 포스트시즌에 진출한다. 순위표의
              PO 배지는 남은 경기 결과와 무관하게 진출이 산술적으로 확정된
              팀에만 표시한다.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}

function LckRoundsTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: LckRoundsDashboardTab;
  onTabChange: (tab: LckRoundsDashboardTab) => void;
}) {
  return (
    <div className="competition-tabs" role="tablist">
      <button
        className={`competition-tab ${
          activeTab === "standings" ? "competition-tab-active" : ""
        }`}
        onClick={() => onTabChange("standings")}
        type="button"
      >
        순위표
      </button>
      <button
        className={`competition-tab ${
          activeTab === "schedule" ? "competition-tab-active" : ""
        }`}
        onClick={() => onTabChange("schedule")}
        type="button"
      >
        일정
      </button>
      <button
        className={`competition-tab ${
          activeTab === "tournament" ? "competition-tab-active" : ""
        }`}
        onClick={() => onTabChange("tournament")}
        type="button"
      >
        토너먼트
      </button>
    </div>
  );
}

function LckRoundsSidePanel({
  competition,
  records,
  userTeamId,
}: {
  competition: CompetitionState;
  records: MatchRecord[];
  userTeamId: string | undefined;
}) {
  const nextUserMatch = getNextUserMatch(competition, userTeamId);
  const recentUserRecord = getRecentUserRecord({
    competition,
    records,
    userTeamId,
  });
  const scheduleById = new Map(competition.schedule.map((match) => [match.id, match]));
  const recentUserMatch = recentUserRecord
    ? scheduleById.get(recentUserRecord.scheduleId)
    : undefined;

  return (
    <aside className="lck-rounds-side-panel">
      <article className="competition-panel lck-rounds-side-card">
        <p className="eyebrow">다음 우리 팀 경기</p>
        {nextUserMatch ? (
          <>
            <strong>{getMatchTitle(nextUserMatch)}</strong>
            <span>{getDateLabel(nextUserMatch.scheduledDate)}</span>
            <small>
              {nextUserMatch.stageName} · {getFormatLabel(nextUserMatch)}
            </small>
          </>
        ) : (
          <>
            <strong>예정 경기 없음</strong>
            <span>정규시즌 일정이 모두 처리되었습니다.</span>
          </>
        )}
      </article>
      <article className="competition-panel lck-rounds-side-card">
        <p className="eyebrow">최근 우리 팀 결과</p>
        {recentUserRecord ? (
          <>
            <strong>
              {recentUserMatch
                ? getMatchTitle(recentUserMatch)
                : recentUserRecord.winnerTeamName}
            </strong>
            <span>
              {getUserResultLabel(recentUserRecord)} ·{" "}
              {recentUserRecord.score.blueWins}-{recentUserRecord.score.redWins}
            </span>
            <small>Winner: {recentUserRecord.winnerTeamName}</small>
          </>
        ) : (
          <>
            <strong>아직 결과 없음</strong>
            <span>첫 우리 팀 경기 후 결과가 표시됩니다.</span>
          </>
        )}
      </article>
    </aside>
  );
}

function LckRoundsStandingsTable({
  competition,
  table,
  userTeamId,
}: {
  competition: CompetitionState;
  table: StandingEntry[];
  userTeamId: string | undefined;
}) {
  const playoffClinchedTeamIds = getPlayoffClinchedTeamIds(competition);

  return (
    <section className="competition-panel lck-rounds-main-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Standings</p>
          <h2>LCK Rounds 1-2 순위표</h2>
        </div>
        <span className="panel-note">타이브레이커 경기 제외</span>
      </div>
      <div className="lck-standings-table lck-standings-header">
        <span>순위</span>
        <span>팀명</span>
        <span>경기</span>
        <span>승</span>
        <span>패</span>
        <span>세트득실</span>
      </div>
      <div className="lck-standings-scroll">
        {table.map((entry, index) => {
          const isPlayoffClinched = playoffClinchedTeamIds.has(entry.teamId);

          return (
            <div key={entry.teamId}>
              <div
                className={`lck-standings-table ${
                  entry.teamId === userTeamId ? "lck-standings-user" : ""
                }`}
              >
                <span>{index + 1}</span>
                <strong>{entry.teamName}</strong>
                <span>{getMatchCount(entry)}</span>
                <span>{entry.wins}</span>
                <span>{entry.losses}</span>
                <span>{getSetDiff(entry)}</span>
                {isPlayoffClinched && <b className="po-badge">PO</b>}
              </div>
              {index === 5 && table.length > 6 && (
                <div
                  aria-label="포스트시즌 컷라인"
                  className="playoff-cutline"
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="standings-footnote">
        상위 6팀이 포스트시즌에 진출합니다. PO 배지는 진출이 산술적으로
        확정된 팀에만 표시됩니다.
      </p>
    </section>
  );
}

function groupMatchesByDate(matches: MatchSchedule[]) {
  const groups = new Map<string, MatchSchedule[]>();

  matches.forEach((match) => {
    const dateKey = match.scheduledDate ?? "undated";
    const group = groups.get(dateKey) ?? [];

    group.push(match);
    groups.set(dateKey, group);
  });

  return [...groups.entries()]
    .sort(([leftDate], [rightDate]) => leftDate.localeCompare(rightDate))
    .map(([dateKey, groupedMatches]) => ({
      dateKey,
      matches: groupedMatches.sort((left, right) => left.id.localeCompare(right.id)),
    }));
}

function LckRoundsScheduleView({
  competition,
  records,
  userTeamId,
}: {
  competition: CompetitionState;
  records: MatchRecord[];
  userTeamId: string | undefined;
}) {
  const recordsByScheduleId = getRecordByScheduleId(records);
  const groupedSchedule = groupMatchesByDate(competition.schedule);

  return (
    <section className="competition-panel lck-rounds-main-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Schedule</p>
          <h2>일정 / 결과</h2>
        </div>
        <span className="panel-note">날짜별 2시리즈 · 우리 팀 경기 강조</span>
      </div>
      <div className="lck-schedule-scroll">
        {groupedSchedule.map(({ dateKey, matches }) => (
          <article className="lck-schedule-day" key={dateKey}>
            <header>
              <strong>{getDateLabel(dateKey)}</strong>
              <span>{matches.length} series</span>
            </header>
            <div className="lck-schedule-day-list">
              {matches.map((match) => {
                const record = recordsByScheduleId.get(match.id);
                const isUserMatch =
                  match.blueTeamId === userTeamId || match.redTeamId === userTeamId;

                return (
                  <div
                    className={`lck-schedule-row ${
                      isUserMatch ? "lck-schedule-row-user" : ""
                    }`}
                    key={match.id}
                  >
                    <div>
                      <strong>{getMatchTitle(match)}</strong>
                      <span>
                        {match.stageName} · {getFormatLabel(match)}
                      </span>
                    </div>
                    <b
                      className={`schedule-status-badge ${
                        record
                          ? getScheduleStatusClass({ match, record, userTeamId })
                          : "schedule-status-scheduled"
                      }`}
                    >
                      {record ? getScoreLabel(record) : "예정"}
                    </b>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function LckPlayoffTeamSlot({
  slot,
  userTeamId,
}: {
  slot: LckPlayoffSlot;
  userTeamId: string | undefined;
}) {
  const classes = [
    "lck-playoff-team",
    slot.isPlaceholder ? "lck-playoff-team-placeholder" : "",
    slot.teamId === userTeamId ? "lck-playoff-team-user" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <span>{slot.label}</span>
      <strong>{slot.teamName}</strong>
      <small>{slot.detail}</small>
    </div>
  );
}

function LckPlayoffMatchCard({
  match,
  userTeamId,
}: {
  match: LckPlayoffMatch;
  userTeamId: string | undefined;
}) {
  return (
    <article className="lck-playoff-match">
      <header>
        <strong>{match.title}</strong>
        <span>{match.subtitle}</span>
      </header>
      <div className="lck-playoff-match-slots">
        {match.slots.map((slot) => (
          <LckPlayoffTeamSlot
            key={`${match.id}-${slot.label}`}
            slot={slot}
            userTeamId={userTeamId}
          />
        ))}
      </div>
    </article>
  );
}

function LckRoundsTournamentView({
  competition,
  table,
  userTeamId,
}: {
  competition: CompetitionState;
  table: StandingEntry[];
  userTeamId: string | undefined;
}) {
  const playoffRounds = getLckRoundsPlayoffMatches({ competition, table });
  const bracketStatus = competition.completed
    ? "정규시즌 시드 확정 · 경기 진행 로직은 11-B에서 연결"
    : "정규시즌 진행 중 · 슬롯은 최종 순위 기준으로 확정";

  return (
    <section className="competition-panel lck-rounds-main-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Tournament</p>
          <h2>LCK Rounds 1-2 포스트시즌</h2>
        </div>
        <span className="panel-note">{bracketStatus}</span>
      </div>
      <div className="lck-playoff-frame">
        <div className="lck-playoff-bracket">
          {playoffRounds.map((round) => (
            <section className="lck-playoff-round" key={round.id}>
              <h3>{round.title}</h3>
              <div className="lck-playoff-match-stack">
                {round.matches.map((match) => (
                  <LckPlayoffMatchCard
                    key={match.id}
                    match={match}
                    userTeamId={userTeamId}
                  />
                ))}
              </div>
            </section>
          ))}
          <section className="lck-playoff-round lck-playoff-champion-round">
            <h3>Champion</h3>
            <article className="lck-playoff-champion-card">
              <span>우승팀</span>
              <strong>{competition.winnerTeamName ?? "우승팀 미정"}</strong>
              <small>
                결승 결과가 확정되면 이 영역에 LCK Rounds 1-2 우승팀이
                표시됩니다.
              </small>
            </article>
          </section>
        </div>
      </div>
    </section>
  );
}

function LckRoundsDashboard({
  career,
  competition,
  records,
  table,
  userTeamId,
}: {
  career: CareerSave;
  competition: CompetitionState;
  records: MatchRecord[];
  table: StandingEntry[];
  userTeamId: string | undefined;
}) {
  const [activeTab, setActiveTab] = useState<LckRoundsDashboardTab>("standings");

  return (
    <section className="competition-dashboard lck-rounds-dashboard">
      <LckRoundsSummary career={career} competition={competition} />
      <LckRoundsTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="lck-rounds-content-grid">
        {activeTab === "standings" && (
          <LckRoundsStandingsTable
            competition={competition}
            table={table}
            userTeamId={userTeamId}
          />
        )}
        {activeTab === "schedule" && (
          <LckRoundsScheduleView
            competition={competition}
            records={records}
            userTeamId={userTeamId}
          />
        )}
        {activeTab === "tournament" && (
          <LckRoundsTournamentView
            competition={competition}
            table={table}
            userTeamId={userTeamId}
          />
        )}
        <LckRoundsSidePanel
          competition={competition}
          records={records}
          userTeamId={userTeamId}
        />
      </div>
    </section>
  );
}

function StandingsTable({
  table,
  userTeamId,
}: {
  table: StandingEntry[];
  userTeamId: string | undefined;
}) {
  return (
    <section className="competition-panel competition-table-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Standings</p>
          <h2>전체 순위표</h2>
        </div>
        <span className="panel-note">경기승 · 세트득실 · 세트승 · 초기 시드 순</span>
      </div>
      <div className="competition-table competition-table-header">
        <span>순위</span>
        <span>팀명</span>
        <span>경기</span>
        <span>세트득실</span>
      </div>
      <div className="competition-table-scroll">
        {table.length === 0 && (
          <div className="competition-empty-state">
            순위표는 대회 일정이 생성되면 표시됩니다.
          </div>
        )}
        {table.map((entry, index) => (
          <div
            className={`competition-table ${
              entry.teamId === userTeamId ? "competition-table-user" : ""
            }`}
            key={entry.teamId}
          >
            <span>{index + 1}</span>
            <strong>{entry.teamName}</strong>
            <span>
              {entry.wins}-{entry.losses}
            </span>
            <span>{getSetDiff(entry)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function GroupStatusPanel({
  competition,
  records,
  table,
}: {
  competition: CompetitionState;
  records: MatchRecord[];
  table: StandingEntry[];
}) {
  if (competition.competitionId !== "lck-cup") {
    return (
      <section className="competition-panel">
        <div className="panel-title-row">
          <div>
            <p className="eyebrow">Format</p>
            <h2>{competition.name} 현황</h2>
          </div>
          <span className="panel-note">{competition.status}</span>
        </div>
        <p className="muted">
          이 대회는 이후 단계에서 조별리그, 진출권, 토너먼트 세부 일정이
          생성되면 상세 현황을 표시합니다.
        </p>
      </section>
    );
  }

  const summary = getLckCupGroupPointSummary(competition, records);

  return (
    <section className="competition-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Groups</p>
          <h2>Baron / Elder 현황</h2>
        </div>
        <span className="panel-note">
          현재 승자 그룹: {getGroupLabel(summary.winnerGroup)}
        </span>
      </div>
      <div className="competition-group-grid">
        {(["baron", "elder"] as LckCupGroupName[]).map((group) => {
          const groupTeams = table.filter((entry) => entry.lckCupGroup === group);

          return (
            <article
              className={`competition-group-card ${
                summary.winnerGroup === group ? "competition-group-card-leading" : ""
              }`}
              key={group}
            >
              <div className="competition-group-head">
                <strong>{getGroupLabel(group)}</strong>
                <span>
                  {summary.groups[group].points} pts / diff{" "}
                  {summary.groups[group].setDiff}
                </span>
              </div>
              <div className="competition-group-team-list">
                {groupTeams.map((entry) => (
                  <span key={entry.teamId}>{entry.teamName}</span>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SchedulePanel({
  competition,
  records,
  userTeamId,
}: {
  competition: CompetitionState;
  records: MatchRecord[];
  userTeamId: string | undefined;
}) {
  const currentWeekMatches = getCurrentWeekMatches(competition);
  const recentRecords = getRecentRecords(competition, records);
  const nextMatches = getNextWeekMatches(competition);
  const scheduleById = new Map(competition.schedule.map((match) => [match.id, match]));

  return (
    <section className="competition-panel competition-schedule-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Schedule</p>
          <h2>일정 / 결과</h2>
        </div>
        <span className="panel-note">현재 주차 · 최근 결과 · 다음 예정</span>
      </div>
      <div className="competition-schedule-columns">
        <ScheduleList
          matches={currentWeekMatches}
          records={records}
          title="현재 주차"
          userTeamId={userTeamId}
        />
        <div className="competition-list-block">
          <strong>최근 결과</strong>
          <div className="competition-list-scroll">
            {recentRecords.length === 0 && <span className="muted">완료된 경기 없음</span>}
            {recentRecords.map((record) => {
              const match = scheduleById.get(record.scheduleId);

              return (
                <div
                  className={`competition-list-row ${
                    record.userResult !== "none" ? "competition-list-row-user" : ""
                  }`}
                  key={record.id}
                >
                  <div>
                    <strong>
                      {match ? getMatchTitle(match) : record.winnerTeamName}
                    </strong>
                    <span>Winner: {record.winnerTeamName}</span>
                  </div>
                  <span>{getScoreLabel(record)}</span>
                </div>
              );
            })}
          </div>
        </div>
        <ScheduleList
          matches={nextMatches}
          records={records}
          title="다음 예정"
          userTeamId={userTeamId}
        />
      </div>
    </section>
  );
}

function ScheduleList({
  matches,
  records,
  title,
  userTeamId,
}: {
  matches: MatchSchedule[];
  records: MatchRecord[];
  title: string;
  userTeamId: string | undefined;
}) {
  return (
    <div className="competition-list-block">
      <strong>{title}</strong>
      <div className="competition-list-scroll">
        {matches.length === 0 && <span className="muted">표시할 경기 없음</span>}
        {matches.map((match) => {
          const record = getMatchRecord(match, records);
          const isUserMatch =
            match.blueTeamId === userTeamId || match.redTeamId === userTeamId;

          return (
            <div
              className={`competition-list-row ${
                isUserMatch ? "competition-list-row-user" : ""
              }`}
              key={match.id}
            >
              <div>
                <strong>{getMatchTitle(match)}</strong>
                <span>
                  {match.stageName} · {getFormatLabel(match)}
                </span>
              </div>
              <span>{getScoreLabel(record)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BracketPanel({
  competition,
  records,
  userTeamId,
}: {
  competition: CompetitionState;
  records: MatchRecord[];
  userTeamId: string | undefined;
}) {
  const recordsByScheduleId = getRecordByScheduleId(records);

  if (competition.competitionId !== "lck-cup") {
    return (
      <section className="competition-panel">
        <div className="panel-title-row">
          <div>
            <p className="eyebrow">Tournament</p>
            <h2>{competition.name} 브래킷</h2>
          </div>
          <span className="panel-note">대회 포맷 구현 후 자동 생성</span>
        </div>
        <div className="competition-bracket-frame competition-bracket-placeholder">
          <strong>{competition.name}</strong>
          <span>
            아직 이 대회의 토너먼트 일정은 생성되지 않았습니다. 진행 엔진이
            연결되면 좌측에서 우측으로 진행되는 브래킷으로 표시됩니다.
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="competition-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Tournament</p>
          <h2>LCK Cup 토너먼트 브래킷</h2>
        </div>
        <span className="panel-note">16:9 와이드 패널 · 좌에서 우로 진행</span>
      </div>
      <div className="competition-bracket-frame">
        <div className="competition-bracket">
          {knockoutRounds.map((round) => {
            const matches = competition.schedule.filter(
              (match) => match.stageName === round.stageName,
            );
            const slots =
              matches.length > 0
                ? matches
                : Array.from({ length: round.slots }, (_, index) => index);

            return (
              <div className="bracket-round" key={round.id}>
                <strong className="bracket-round-title">{round.title}</strong>
                <div className="bracket-match-stack">
                  {slots.map((slot) =>
                    typeof slot === "number" ? (
                      <div className="bracket-match bracket-match-empty" key={slot}>
                        <span>진출팀 대기</span>
                        <small>{round.stageName}</small>
                      </div>
                    ) : (
                      <BracketMatch
                        key={slot.id}
                        match={slot}
                        record={recordsByScheduleId.get(slot.id)}
                        userTeamId={userTeamId}
                      />
                    ),
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BracketMatch({
  match,
  record,
  userTeamId,
}: {
  match: MatchSchedule;
  record: MatchRecord | undefined;
  userTeamId: string | undefined;
}) {
  return (
    <div className="bracket-match">
      <span className={getTeamClass({ teamId: match.blueTeamId, record, userTeamId })}>
        {match.blueTeamName}
      </span>
      <span className={getTeamClass({ teamId: match.redTeamId, record, userTeamId })}>
        {match.redTeamName}
      </span>
      <small>
        {getFormatLabel(match)} · {getScoreLabel(record)}
      </small>
    </div>
  );
}

export function CompetitionDashboard({
  career,
  competitionId,
}: CompetitionDashboardProps) {
  const competition = getCurrentCompetition(career, competitionId);

  if (!competition) {
    return (
      <section className="competition-dashboard">
        <section className="competition-panel">
          <p className="eyebrow">Competition</p>
          <h1>진행 중인 대회 없음</h1>
          <p className="muted">스토브리그가 끝나면 LCK Cup 현황이 표시됩니다.</p>
        </section>
      </section>
    );
  }

  const records = career.seasonState.matchRecords;
  const userTeamId = getUserTeamId(competition);
  const table = getSortedTable(competition, records);

  if (competition.competitionId === "lck-rounds-1-2") {
    return (
      <LckRoundsDashboard
        career={career}
        competition={competition}
        records={records}
        table={table}
        userTeamId={userTeamId}
      />
    );
  }

  return (
    <section className="competition-dashboard">
      <CompetitionSummary
        career={career}
        competition={competition}
        userTeamId={userTeamId}
      />
      <div className="competition-overview-grid">
        <StandingsTable table={table} userTeamId={userTeamId} />
        <GroupStatusPanel
          competition={competition}
          records={records}
          table={table}
        />
      </div>
      <SchedulePanel
        competition={competition}
        records={records}
        userTeamId={userTeamId}
      />
      <BracketPanel
        competition={competition}
        records={records}
        userTeamId={userTeamId}
      />
    </section>
  );
}
