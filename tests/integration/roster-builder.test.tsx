import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { samplePlayers } from "../../src/data/samplePlayers";
import { RosterBuilder } from "../../src/features/roster-builder";
import type { Team } from "../../src/types/game";

const emptyTeam: Team = {
  name: "Test Team",
  region: "lck",
  budget: 650,
  rosterSettings: {
    minPlayers: 10,
    maxPlayers: 15,
    freeMovementBetweenMainAndAcademy: true,
  },
  roster: {},
  mainRosterPlayerIds: [],
  academyRosterPlayerIds: [],
  contracts: [],
  wins: 0,
  losses: 0,
  elo: 1500,
};

describe("RosterBuilder", () => {
  it("shows validation errors before all roles are filled", () => {
    render(
      <RosterBuilder
        players={samplePlayers}
        team={emptyTeam}
        onSelectPlayer={vi.fn()}
        onSignPlayer={vi.fn()}
        onReleasePlayer={vi.fn()}
        onConfirmRoster={vi.fn()}
      />,
    );

    expect(screen.getByText("Missing top starter.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirm roster and contracts/i })).toBeDisabled();
  });

  it("emits signed and starter player actions", () => {
    const onSignPlayer = vi.fn();
    const onSelectPlayer = vi.fn();
    const teamWithSignedTop: Team = {
      ...emptyTeam,
      academyRosterPlayerIds: ["lck-top-01"],
    };

    render(
      <RosterBuilder
        players={samplePlayers}
        team={teamWithSignedTop}
        onSelectPlayer={onSelectPlayer}
        onSignPlayer={onSignPlayer}
        onReleasePlayer={vi.fn()}
        onConfirmRoster={vi.fn()}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Sign" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Start" })[0]);

    expect(onSignPlayer).toHaveBeenCalledWith(samplePlayers[1]);
    expect(onSelectPlayer).toHaveBeenCalledWith("top", samplePlayers[0]);
  });
});
