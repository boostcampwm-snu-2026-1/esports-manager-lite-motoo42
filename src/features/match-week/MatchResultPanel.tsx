import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import type { MatchResult, Role } from "../../types/game";

type MatchResultPanelProps = {
  result: MatchResult | null;
  onViewCalendar: () => void;
};

const roles: Role[] = ["top", "jungle", "mid", "bot", "support"];

export function MatchResultPanel({ result, onViewCalendar }: MatchResultPanelProps) {
  return (
    <Card>
      <h2>최근 경기 기록</h2>
      {!result && (
        <p className="muted">
          아직 최근 경기 결과가 없습니다. 경기일에는 상단 진행 버튼이 플레이 흐름으로 전환됩니다.
        </p>
      )}
      {result && (
        <>
          <p>
            승리 팀: <strong>{result.winner === "user" ? "우리 팀" : "상대 팀"}</strong>
          </p>
          <ul>
            {result.log.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          {result.draft && (
            <section className="draft-summary">
              <h3>밴픽 지표</h3>
              <div className="draft-score-row">
                <span>우리 밴픽: {result.draft.blueDraftPower}</span>
                <span>상대 밴픽: {result.draft.redDraftPower}</span>
                <strong>
                  Net: {result.draft.netDraftPower >= 0 ? "+" : ""}
                  {result.draft.netDraftPower}
                </strong>
              </div>
              <p className="muted">
                밴: {result.draft.blueBans.join(", ")} /{" "}
                {result.draft.redBans.join(", ")}
              </p>
              <div className="draft-grid">
                {roles.map((role) => {
                  const bluePick = result.draft?.bluePicks[role];
                  const redPick = result.draft?.redPicks[role];

                  return (
                    <div className="draft-row" key={role}>
                      <strong>{role}</strong>
                      <span>
                        {bluePick
                          ? `${bluePick.championName} (${bluePick.fitScore})`
                          : "픽 없음"}
                      </span>
                      <span>
                        {redPick
                          ? `${redPick.championName} (${redPick.fitScore})`
                          : "픽 없음"}
                      </span>
                    </div>
                  );
                })}
              </div>
              <ul>
                {result.draft.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>
          )}
          <Button onClick={onViewCalendar}>시즌 일정 보기</Button>
        </>
      )}
    </Card>
  );
}
