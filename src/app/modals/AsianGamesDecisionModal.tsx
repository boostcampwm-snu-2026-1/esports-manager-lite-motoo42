import { getAsianGamesRoleSelectionLabel } from "../../domain/season";
import type { AsianGamesState } from "../../types/game";

function roleLabel(role: AsianGamesState["roster"][number]["role"]) {
  if (role === "jungle") {
    return "JGL";
  }

  return role.toUpperCase();
}

export function AsianGamesDecisionModal({
  asianGamesState,
  onSelectAuto,
  onSelectManual,
}: {
  asianGamesState: AsianGamesState;
  onSelectAuto: () => void;
  onSelectManual: () => void;
}) {
  const starters = asianGamesState.roster.filter((member) => member.isStarter);
  const sixthMan = asianGamesState.roster.find((member) => !member.isStarter);

  return (
    <div className="modal-backdrop asian-games-decision-backdrop">
      <section
        aria-labelledby="asian-games-decision-title"
        aria-modal="true"
        className="asian-games-decision-modal"
        role="dialog"
      >
        <p className="eyebrow">Asian Games</p>
        <h2 id="asian-games-decision-title">대한민국 대표팀 참가 방식</h2>
        <p>
          대표 6인이 자동 선발됐습니다. 이번 Asian Games 전체를 직접
          플레이할지, AI가 자동 진행할지 선택하세요.
        </p>
        <div className="asian-games-decision-roster">
          {starters.map((member) => (
            <article key={member.playerId}>
              <span>{roleLabel(member.role)}</span>
              <strong>{member.playerName}</strong>
              <small>
                {getAsianGamesRoleSelectionLabel(member)} · 폼{" "}
                {member.formAtSelection}
              </small>
            </article>
          ))}
          {sixthMan && (
            <article className="asian-games-sixth-player" key={sixthMan.playerId}>
              <span>6TH</span>
              <strong>{sixthMan.playerName}</strong>
              <small>
                {getAsianGamesRoleSelectionLabel(sixthMan)} · 폼{" "}
                {sixthMan.formAtSelection}
              </small>
            </article>
          )}
        </div>
        <div className="asian-games-decision-actions">
          <button onClick={onSelectManual} type="button">
            직접 플레이
          </button>
          <button onClick={onSelectAuto} type="button">
            자동 진행
          </button>
        </div>
      </section>
    </div>
  );
}
