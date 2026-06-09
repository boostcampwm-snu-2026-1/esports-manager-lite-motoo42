import { describe, expect, it } from "vitest";
import {
  createMonthGrid,
  formatDateRange,
  getMatchDisplayDate,
  getRoadmapWindows,
  toDateKey,
} from "../../src/domain/season-calendar/seasonCalendarDates";
import type { MatchSchedule } from "../../src/types/game";

function createMatch(partial: Partial<MatchSchedule> = {}): MatchSchedule {
  return {
    id: "lck-cup-week1-match1",
    competitionId: "lck-cup",
    week: 1,
    stageName: "Group Battle",
    blueTeamId: "t1",
    blueTeamName: "T1",
    redTeamId: "gen-g",
    redTeamName: "Gen.G",
    format: "bo3",
    status: "scheduled",
    fearlessEnabled: true,
    ...partial,
  };
}

describe("season calendar date helpers", () => {
  it("creates a real Gregorian month grid for January 2026", () => {
    const cells = createMonthGrid(2026, 0);

    expect(cells.slice(0, 4).every((cell) => cell.date === null)).toBe(true);
    expect(cells[4].key).toBe("2026-01-01");
    expect(cells).toHaveLength(35);
  });

  it("places domestic weekly matches from Wednesday through Sunday", () => {
    const firstMatchDate = getMatchDisplayDate({
      calendarType: "asian-games",
      match: createMatch(),
      matchIndexInWeek: 0,
      year: 2026,
    });
    const fifthMatchDate = getMatchDisplayDate({
      calendarType: "asian-games",
      match: createMatch({ id: "lck-cup-week1-match5" }),
      matchIndexInWeek: 4,
      year: 2026,
    });

    expect(toDateKey(firstMatchDate)).toBe("2026-01-14");
    expect(toDateKey(fifthMatchDate)).toBe("2026-01-18");
  });

  it("uses separate roadmap templates for Asian Games and normal seasons", () => {
    expect(
      getRoadmapWindows("asian-games").map((window) => window.competitionId),
    ).toContain("asian-games");
    expect(
      getRoadmapWindows("normal").map((window) => window.competitionId),
    ).not.toContain("asian-games");
  });

  it("uses compact date ranges for competitions inside one month", () => {
    expect(formatDateRange(2026, "first-stand", "asian-games")).toBe("3/10 - 23");
    expect(formatDateRange(2026, "worlds", "asian-games")).toBe("10/6 - 11/23");
  });
});
