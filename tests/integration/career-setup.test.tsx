import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { lck2026Teams } from "../../src/data/lckTeams";
import { CareerSetup } from "../../src/features/career-setup";

describe("CareerSetup", () => {
  it("renders the 10 LCK team choices and starts from the selected team", () => {
    const onStart = vi.fn();

    render(<CareerSetup onStart={onStart} />);

    for (const team of lck2026Teams) {
      expect(
        screen.getByRole("button", { name: new RegExp(team.name) }),
      ).toBeVisible();
    }

    expect(screen.getByText("젠지")).toBeVisible();
    expect(screen.getByText("DN 수퍼스")).toBeVisible();

    expect(screen.getByRole("img", { name: "LCK logo" })).toBeVisible();
    expect(screen.getByRole("img", { name: "T1 logo" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /Gen\.G/ }));
    fireEvent.click(screen.getByRole("button", { name: "Start career" }));

    expect(onStart).toHaveBeenCalledWith("Gen.G", "preseason");
  });

  it("can start directly from the 2026 real roster LCK Cup entry", () => {
    const onStart = vi.fn();

    render(<CareerSetup onStart={onStart} />);

    fireEvent.click(screen.getByLabelText(/2026 실제 LCK 로스터로 자동 시작/));
    fireEvent.click(screen.getByRole("button", { name: /KT Rolster/ }));
    fireEvent.click(screen.getByRole("button", { name: "Start career" }));

    expect(onStart).toHaveBeenCalledWith(
      "KT Rolster",
      "real-roster-lck-cup",
    );
  });
});
