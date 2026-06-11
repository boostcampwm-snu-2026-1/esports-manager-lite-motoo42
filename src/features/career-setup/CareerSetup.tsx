import { type ReactNode, useState } from "react";
import { getLckTeamDisplayName, lck2026Teams } from "../../data/lckTeams";
import { formatSalaryAmount } from "../../shared/format/money";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { TeamLogo } from "../../shared/ui/TeamLogo";
import type { CareerStartMode } from "../../domain/career/createInitialCareer";

type CareerSetupProps = {
  savePanel?: ReactNode;
  onStart: (teamName: string, startMode?: CareerStartMode) => void;
};

export function CareerSetup({ savePanel, onStart }: CareerSetupProps) {
  const defaultTeam = lck2026Teams.find((team) => team.shortName === "T1") ?? lck2026Teams[0];
  const [selectedTeamId, setSelectedTeamId] = useState(defaultTeam.id);
  const [useRealRosterStart, setUseRealRosterStart] = useState(false);
  const selectedTeam =
    lck2026Teams.find((team) => team.id === selectedTeamId) ?? defaultTeam;

  return (
    <section className="stack">
      <header className="career-setup-heading">
        <TeamLogo variant="league" size="lg" />
        <div>
          <p className="eyebrow">Career setup</p>
          <h1>LCK 팀을 선택하세요</h1>
          <p className="lede">
            2026 LCK 기존 선수단으로 프리시즌 스토브리그를 시작합니다.
          </p>
        </div>
      </header>

      <Card>
        <div className="career-team-selection">
          {lck2026Teams.map((team) => {
            const isSelected = team.id === selectedTeam.id;
            const displayName = getLckTeamDisplayName(team);

            return (
              <button
                aria-label={`${displayName} ${team.name} 선택`}
                aria-pressed={isSelected}
                className={`career-team-card ${isSelected ? "career-team-card-selected" : ""}`}
                key={team.id}
                onClick={() => setSelectedTeamId(team.id)}
                type="button"
              >
                <div className="career-team-card-header">
                  <TeamLogo team={team} size="md" />
                  <div>
                    <span className="career-team-short-name">
                      {team.shortName}
                    </span>
                    <strong>{displayName}</strong>
                    {displayName !== team.name && (
                      <small className="career-team-english-name">{team.name}</small>
                    )}
                  </div>
                </div>
                <dl>
                  <div>
                    <dt>티어</dt>
                    <dd>{team.tier}</dd>
                  </div>
                  <div>
                    <dt>전력</dt>
                    <dd>{team.strength}</dd>
                  </div>
                  <div>
                    <dt>예산</dt>
                    <dd>{formatSalaryAmount(team.budget)}</dd>
                  </div>
                  <div>
                    <dt>예상 순위</dt>
                    <dd>{team.previousSeasonRank}위</dd>
                  </div>
                </dl>
              </button>
            );
          })}
        </div>
        <div className="career-team-start-row">
          <div className="career-team-start-copy">
            <p>
              선택 팀: <strong>{getLckTeamDisplayName(selectedTeam)}</strong>
            </p>
            <label className="career-real-roster-toggle">
              <input
                checked={useRealRosterStart}
                onChange={(event) => setUseRealRosterStart(event.target.checked)}
                type="checkbox"
              />
              <span>
                2026 실제 LCK 로스터로 자동 시작
                <small>
                  프리시즌 스토브리그를 건너뛰고 LCK Cup부터 바로 시작합니다.
                </small>
              </span>
            </label>
          </div>
          <Button
            onClick={() =>
              onStart(
                selectedTeam.name,
                useRealRosterStart ? "real-roster-lck-cup" : "preseason",
              )
            }
          >
            Start career
          </Button>
        </div>
      </Card>
      {savePanel}
    </section>
  );
}
