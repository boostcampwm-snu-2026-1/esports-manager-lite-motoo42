import { findLckTeamSeed, getLckTeamDisplayName } from "../../data/lckTeams";
import { TeamLogo } from "../../shared/ui/TeamLogo";
import type { MatchRecord, StandingEntry } from "../../types/game";

export function TeamNameCell({
  entry,
  onViewTeam,
}: {
  entry: StandingEntry;
  onViewTeam?: (teamId: string) => void;
}) {
  const lckTeam = findLckTeamSeed(entry.teamId) ?? findLckTeamSeed(entry.teamName);
  const displayName = lckTeam
    ? getLckTeamDisplayName(lckTeam)
    : getLckTeamDisplayName(entry.teamName);

  if (!lckTeam || !onViewTeam) {
    return <strong>{displayName}</strong>;
  }

  return (
    <button
      className="team-link-button team-name-with-logo"
      onClick={() => onViewTeam(lckTeam.id)}
      type="button"
    >
      <TeamLogo team={lckTeam} size="sm" />
      <span>{displayName}</span>
    </button>
  );
}

export function getTeamClass({
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
