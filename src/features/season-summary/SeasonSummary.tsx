import { useMemo, useState } from "react";
import { formatSalaryAmount } from "../../shared/format/money";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import type {
  CareerSave,
  OffseasonLogEntry,
  Player,
  SeasonCompetitionSummary,
  SeasonSummary as SeasonSummaryRecord,
} from "../../types/game";

type SeasonSummaryProps = {
  career: CareerSave;
  onStartOffseason: () => void;
  onViewRoster: () => void;
};

function getLatestSummary(career: CareerSave) {
  const summarySeasonNumber =
    career.seasonState.offseason?.summarySeasonNumber ?? career.currentSeason;

  return (
    [...career.seasonHistory]
      .reverse()
      .find((summary) => summary.seasonNumber === summarySeasonNumber) ??
    career.seasonHistory[career.seasonHistory.length - 1]
  );
}

function getSummaryOptions(career: CareerSave) {
  const summaries = [...career.seasonHistory].sort(
    (left, right) => left.seasonNumber - right.seasonNumber,
  );

  return summaries.length > 0 ? summaries : [getFallbackSummary(career)];
}

function getFallbackSummary(career: CareerSave): SeasonSummaryRecord {
  return {
    seasonNumber: career.currentSeason,
    yearLabel: career.seasonState.yearLabel,
    calendarType: career.seasonState.calendarType,
    lckResult: "진행 중",
    finalElo: career.userTeam.elo,
    finalRecord: {
      wins: career.userTeam.wins,
      losses: career.userTeam.losses,
    },
    competitionResults: career.seasonState.competitions
      .filter((competition) => competition.status !== "locked")
      .map((competition) => ({
        competitionId: competition.competitionId,
        competitionName: competition.name,
        resultLabel: competition.completed
          ? competition.winnerTeamName
            ? `${competition.winnerTeamName} 우승`
            : "완료"
          : "진행 중",
        winnerTeamName: competition.winnerTeamName,
      })),
  };
}

function getPlayerName(players: Player[], playerId: string) {
  return players.find((player) => player.id === playerId)?.name ?? playerId;
}

function getPlayerNames(players: Player[], playerIds: string[] = []) {
  return playerIds.map((playerId) => getPlayerName(players, playerId));
}

function getExpiredPlayers(career: CareerSave) {
  const expiredIds =
    career.seasonState.offseason?.expiredContractPlayerIds ??
    getLatestSummary(career)?.expiredContractPlayerIds ??
    [];

  return expiredIds
    .map((playerId) => career.lckPlayers.find((player) => player.id === playerId))
    .filter((player): player is Player => Boolean(player));
}

function SummaryMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <article className="season-summary-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </article>
  );
}

function getTimelineResult(summary: SeasonSummaryRecord) {
  const worldsLabel = summary.worldsChampionTeamName
    ? `Worlds ${summary.worldsChampionTeamName}`
    : "Worlds 미정";

  return `${summary.lckResult} · ${worldsLabel}`;
}

function CompetitionResultList({
  results,
}: {
  results: SeasonCompetitionSummary[];
}) {
  if (results.length === 0) {
    return <p className="muted">아직 기록된 대회 결과가 없습니다.</p>;
  }

  return (
    <div className="season-competition-results">
      {results.map((result) => (
        <article
          className="season-competition-result"
          key={result.competitionId}
        >
          <div>
            <span>{result.competitionName}</span>
            <strong>{result.resultLabel}</strong>
          </div>
          <small>{result.userResultLabel ?? "유저 팀 기록 없음"}</small>
        </article>
      ))}
    </div>
  );
}

function SeasonTimeline({
  selectedSeasonNumber,
  summaries,
  onSelect,
}: {
  selectedSeasonNumber: number;
  summaries: SeasonSummaryRecord[];
  onSelect: (seasonNumber: number) => void;
}) {
  return (
    <div className="season-history-timeline" aria-label="시즌 히스토리">
      {summaries.map((summary) => (
        <button
          aria-pressed={summary.seasonNumber === selectedSeasonNumber}
          className={`season-history-card ${
            summary.seasonNumber === selectedSeasonNumber
              ? "season-history-card-active"
              : ""
          }`}
          key={summary.seasonNumber}
          onClick={() => onSelect(summary.seasonNumber)}
          type="button"
        >
          <span>{summary.yearLabel ?? `S${summary.seasonNumber}`}</span>
          <strong>Season {summary.seasonNumber}</strong>
          <small>{getTimelineResult(summary)}</small>
        </button>
      ))}
    </div>
  );
}

function OffseasonLogList({ entries }: { entries: OffseasonLogEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="season-summary-empty-note">
        아직 이 시즌에 남은 스토브리그 로그가 없습니다.
      </p>
    );
  }

  return (
    <div className="season-offseason-log-list">
      {entries.map((entry) => (
        <article className="season-offseason-log-row" key={entry.id}>
          <span>
            W{entry.week} · D{entry.day}
          </span>
          <strong>{entry.message}</strong>
        </article>
      ))}
    </div>
  );
}

function PlayerChangeGroup({
  label,
  names,
}: {
  label: string;
  names: string[];
}) {
  if (names.length === 0) {
    return null;
  }

  return (
    <article className="season-player-change-group">
      <span>{label}</span>
      <strong>{names.join(", ")}</strong>
    </article>
  );
}

export function SeasonSummary({
  career,
  onStartOffseason,
  onViewRoster,
}: SeasonSummaryProps) {
  const summaryOptions = useMemo(() => getSummaryOptions(career), [career]);
  const latestSummary = getLatestSummary(career) ?? getFallbackSummary(career);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(
    latestSummary.seasonNumber,
  );
  const summary =
    summaryOptions.find(
      (candidate) => candidate.seasonNumber === selectedSeasonNumber,
    ) ?? latestSummary;
  const expiredPlayers = useMemo(() => getExpiredPlayers(career), [career]);
  const offseason = career.seasonState.offseason;
  const isCareerComplete =
    career.seasonState.phase === "completed" ||
    offseason?.status === "career-completed";
  const hasThreeSeasonHistory = career.seasonHistory.length >= 3;
  const canEnterOffseason =
    career.seasonState.phase === "offseason" &&
    !isCareerComplete &&
    offseason?.status !== "active" &&
    offseason?.status !== "ready-for-next-season";
  const finalRecord = summary.finalRecord ?? {
    wins: career.userTeam.wins,
    losses: career.userTeam.losses,
  };
  const competitionResults = summary.competitionResults ?? [];
  const offseasonSummary = summary.offseasonSummary;
  const renewedNames = getPlayerNames(
    career.lckPlayers,
    offseasonSummary?.renewedPlayerIds,
  );
  const releasedNames = getPlayerNames(
    career.lckPlayers,
    offseasonSummary?.releasedPlayerIds,
  );
  const signedNames = getPlayerNames(
    career.lckPlayers,
    offseasonSummary?.signedPlayerIds,
  );
  const retiredNames = getPlayerNames(
    career.lckPlayers,
    offseasonSummary?.retiredPlayerIds,
  );
  const militaryNames = getPlayerNames(
    career.lckPlayers,
    offseasonSummary?.militaryServicePlayerIds,
  );
  const notableLogEntries = offseasonSummary?.notableLogEntries ?? [];
  const aiSigningCount = offseasonSummary?.aiSigningCount ?? 0;
  const hasPlayerChanges =
    renewedNames.length +
      releasedNames.length +
      signedNames.length +
      retiredNames.length +
      militaryNames.length >
      0 || aiSigningCount > 0;

  return (
    <section className="stack season-summary-page">
      <header className="season-summary-header">
        <div>
          <p className="eyebrow">Career Chronicle</p>
          <h1>{summary.yearLabel ?? career.seasonState.yearLabel} 시즌의 발자취</h1>
          <p className="lede">
            {career.userTeam.name}이 지나온 시간과 남은 기록을 천천히
            돌아봅니다.
          </p>
        </div>
        <div className="season-summary-status">
          <span>
            {career.seasonHistory.length} seasons archived
          </span>
          <strong>
            {isCareerComplete
              ? "커리어 완료"
              : hasThreeSeasonHistory
                ? "3시즌 결산"
                : canEnterOffseason
                  ? "스토브리그 대기"
                  : "시즌 기록"}
          </strong>
        </div>
      </header>

      <SeasonTimeline
        onSelect={setSelectedSeasonNumber}
        selectedSeasonNumber={summary.seasonNumber}
        summaries={summaryOptions}
      />

      <div className="season-summary-board">
        <Card className="season-summary-record-card">
          <div className="season-summary-card-title">
            <div>
              <p className="eyebrow">남은 기록</p>
              <h2>{career.userTeam.name}</h2>
            </div>
          </div>
          <div className="season-summary-metrics">
            <SummaryMetric
              label="최종 성적"
              value={`${finalRecord.wins}W ${finalRecord.losses}L`}
            />
            <SummaryMetric
              label="최종 ELO"
              value={`${summary.finalElo}`}
              detail="다음 시즌에도 유지"
            />
            <SummaryMetric label="LCK 결과" value={summary.lckResult} />
            <SummaryMetric
              label="Worlds"
              value={summary.worldsChampionTeamName ?? "미정"}
              detail={summary.worldsChampionTeamName ? "Champion" : undefined}
            />
          </div>
        </Card>

        <Card className="season-summary-competition-card">
          <div className="season-summary-card-title">
            <div>
              <p className="eyebrow">시즌의 발자취</p>
              <h2>대회별 요약</h2>
            </div>
          </div>
          <CompetitionResultList results={competitionResults} />
        </Card>

        <Card className="season-summary-market-card">
          <div className="season-summary-card-title">
            <div>
              <p className="eyebrow">스토브리그의 흔적</p>
              <h2>시장 결산</h2>
            </div>
          </div>
          <div className="season-summary-metrics season-offseason-metrics">
            <SummaryMetric label="재계약" value={`${renewedNames.length}`} />
            <SummaryMetric label="방출" value={`${releasedNames.length}`} />
            <SummaryMetric label="FA 영입" value={`${signedNames.length}`} />
            <SummaryMetric label="AI 보강" value={`${aiSigningCount}`} />
          </div>
          <OffseasonLogList entries={notableLogEntries} />
        </Card>

        <Card className="season-summary-player-card">
          <div className="season-summary-card-title">
            <div>
              <p className="eyebrow">선수 변화</p>
              <h2>남겨진 이름들</h2>
            </div>
          </div>

          {hasPlayerChanges ? (
            <div className="season-player-change-list">
              <PlayerChangeGroup label="재계약" names={renewedNames} />
              <PlayerChangeGroup label="방출" names={releasedNames} />
              <PlayerChangeGroup label="영입" names={signedNames} />
              <PlayerChangeGroup label="은퇴" names={retiredNames} />
              <PlayerChangeGroup label="군입대" names={militaryNames} />
              {aiSigningCount > 0 && (
                <article className="season-player-change-group">
                  <span>AI 팀 보강</span>
                  <strong>{aiSigningCount}건</strong>
                </article>
              )}
            </div>
          ) : (
            <p className="season-summary-empty-note">
              아직 이 시즌에 저장된 선수 변화 기록이 없습니다.
            </p>
          )}
        </Card>

        <Card className="season-summary-next-card">
          <div className="season-summary-card-title">
            <div>
              <p className="eyebrow">Next Chapter</p>
              <h2>
                {isCareerComplete || hasThreeSeasonHistory
                  ? "커리어 결산"
                  : "다음 장"}
              </h2>
            </div>
          </div>

          {isCareerComplete || hasThreeSeasonHistory ? (
            <div className="season-summary-empty">
              <strong>세 시즌의 기록이 히스토리에 남았습니다.</strong>
              <span>승리와 이적, 남겨진 이름들이 이 커리어의 결말입니다.</span>
            </div>
          ) : canEnterOffseason ? (
            <div className="season-summary-renewal-ready">
              <strong>28일 스토브리그가 대기 중입니다.</strong>
              <span>
                이 시즌의 마지막 결정은 재계약, 방출, 그리고 FA 시장에서
                이어집니다.
              </span>
            </div>
          ) : (
            <div className="season-summary-empty">
              <strong>기록은 시즌 히스토리에 보존됩니다.</strong>
              <span>다음 결산은 시즌이 끝난 뒤 다시 열립니다.</span>
            </div>
          )}

          {canEnterOffseason && expiredPlayers.length > 0 && (
            <div className="season-renewal-panel">
              <div className="section-label-row">
                <span>계약 만료</span>
                <strong>{expiredPlayers.length} players</strong>
              </div>
              <div className="season-renewal-list">
                {expiredPlayers.map((player) => (
                  <article className="season-renewal-row" key={player.id}>
                    <div>
                      <strong>{player.name}</strong>
                      <span>
                        {player.role.toUpperCase()} · {player.currentTeam} ·
                        salary {formatSalaryAmount(player.salaryExpectation)}
                      </span>
                      <small>스토브리그 1주차에서 재계약 또는 방출 결정</small>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          <div className="season-summary-actions">
            <Button disabled={!canEnterOffseason} onClick={onStartOffseason}>
              스토브리그 진입
            </Button>
            <Button variant="ghost" onClick={onViewRoster}>
              로스터 확인
            </Button>
          </div>
        </Card>
      </div>

      {summary.expiredContractPlayerIds &&
        summary.expiredContractPlayerIds.length > 0 && (
          <p className="muted season-summary-expired-note">
            만료 선수:{" "}
            {summary.expiredContractPlayerIds
              .map((playerId) => getPlayerName(career.lckPlayers, playerId))
              .join(", ")}
          </p>
        )}
    </section>
  );
}
