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
      <h2>Result log</h2>
      {!result && <p className="muted">No match simulated yet.</p>}
      {result && (
        <>
          <p>
            Winner: <strong>{result.winner === "user" ? "Your team" : "Opponent"}</strong>
          </p>
          <ul>
            {result.log.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          {result.draft && (
            <section className="draft-summary">
              <h3>Draft indicators</h3>
              <div className="draft-score-row">
                <span>Your draft: {result.draft.blueDraftPower}</span>
                <span>Opponent draft: {result.draft.redDraftPower}</span>
                <strong>
                  Net: {result.draft.netDraftPower >= 0 ? "+" : ""}
                  {result.draft.netDraftPower}
                </strong>
              </div>
              <p className="muted">Bans: {result.draft.blueBans.join(", ")} / {result.draft.redBans.join(", ")}</p>
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
                          : "No pick"}
                      </span>
                      <span>
                        {redPick
                          ? `${redPick.championName} (${redPick.fitScore})`
                          : "No pick"}
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
          <Button onClick={onViewCalendar}>View season calendar</Button>
        </>
      )}
    </Card>
  );
}
