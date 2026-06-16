import { getCompetitionTemplate } from "../../data/competitions";
import {
  getLckCupGroupPointSummary,
  getLckCupStageNames,
} from "../../domain/season";
import type {
  CareerSave,
  CompetitionState,
  LckCupGroupName,
  MatchRecord,
  MatchSchedule,
  StandingEntry,
} from "../../types/game";
import {
  getDateLabel,
  getFormatLabel,
  getGroupLabel,
  getMatchCount,
  getMatchTitle,
  getScoreLabel,
  getSetDiff,
  getStatusText,
} from "./competitionDashboardFormatters";
import {
  getCurrentWeekMatches,
  getMatchRecord,
  getNextWeekMatches,
  getRecentRecords,
  getRecordByScheduleId,
} from "./competitionDashboardSchedule";
import { TeamNameCell, getTeamClass } from "./competitionDashboardTeams";

const lckCupStageNames = getLckCupStageNames();
const knockoutRounds = [
  {
    id: "play-in-r1",
    title: "플레이-인 R1",
    stageName: lckCupStageNames.playInRound1,
    slots: 2,
  },
  {
    id: "play-in-r2",
    title: "플레이-인 R2",
    stageName: lckCupStageNames.playInRound2,
    slots: 2,
  },
  {
    id: "wildcard",
    title: "와일드카드",
    stageName: lckCupStageNames.playoffsWildcard,
    slots: 1,
  },
  {
    id: "semifinals",
    title: "준결승",
    stageName: lckCupStageNames.playoffsSemifinals,
    slots: 2,
  },
  {
    id: "finals",
    title: "결승",
    stageName: lckCupStageNames.finals,
    slots: 1,
  },
];

export function CompetitionSummary({
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
        <p className="eyebrow">대회</p>
        <h1>{competition.name}</h1>
        <span>{career.seasonState.currentDateLabel}</span>
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">단계</p>
        <strong>{getStatusText(competition)}</strong>
        <span>{competition.currentWeek}주차</span>
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">우리 팀</p>
        <strong>
          {userStanding?.teamName ?? career.userTeam.name} · {career.userTeam.wins}W{" "}
          {career.userTeam.losses}L
        </strong>
        <span>현재 대회 기준 성적을 추적합니다.</span>
      </article>
      <article className="competition-summary-card">
        <p className="eyebrow">다음 일정</p>
        <strong>
          {nextMatches[0] ? `${nextMatches[0].week}주차` : "예정 경기 없음"}
        </strong>
        <span>
          {nextMatches[0]
            ? `${nextMatches.length}개 시리즈 대기 중`
            : "다음 단계 연결을 기다리는 중입니다."}
        </span>
      </article>
      <CompetitionFormatSummary competition={competition} />
    </section>
  );
}

export function CompetitionFormatSummary({
  competition,
}: {
  competition: CompetitionState;
}) {
  const template = getCompetitionTemplate(competition.competitionId);

  if (!template) {
    return null;
  }

  return (
    <article className="competition-summary-card competition-summary-card-format">
      <p className="eyebrow">포맷</p>
      <strong>{template.formatSummary}</strong>
      <span>{template.qualificationRule ?? "대회 결과에 따라 다음 경로가 연결됩니다."}</span>
      <ul className="competition-format-list">
        {template.stages.slice(0, 3).map((stage) => (
          <li key={stage.name}>
            <b>{stage.name}</b>
            <span>{stage.format}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function StandingsTable({
  onViewTeam,
  table,
  userTeamId,
}: {
  onViewTeam?: (teamId: string) => void;
  table: StandingEntry[];
  userTeamId: string | undefined;
}) {
  return (
    <section className="competition-panel competition-table-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">순위표</p>
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
            <TeamNameCell entry={entry} onViewTeam={onViewTeam} />
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

export function GroupStatusPanel({
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
            <p className="eyebrow">포맷</p>
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
          <p className="eyebrow">그룹 포인트</p>
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
                  {summary.groups[group].points}Points · 세트득실{" "}
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

export function SchedulePanel({
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
          <p className="eyebrow">일정</p>
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
                    <span>승자: {record.winnerTeamName}</span>
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

export function ScheduleList({
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

export function BracketPanel({
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
            <p className="eyebrow">토너먼트</p>
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
          <p className="eyebrow">토너먼트</p>
          <h2>LCK Cup 토너먼트</h2>
        </div>
        <span className="panel-note">좌에서 우로 진행</span>
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
                        <small>{round.title}</small>
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

export function BracketMatch({
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
