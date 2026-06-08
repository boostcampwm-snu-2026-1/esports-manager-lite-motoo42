import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppErrorBoundary } from "../../src/app/AppErrorBoundary";

function ThrowingView() {
  throw new Error("render failed");

  return <div />;
}

describe("AppErrorBoundary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a recovery screen instead of crashing to a blank page", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <AppErrorBoundary>
        <ThrowingView />
      </AppErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "화면을 복구할 수 없습니다",
    );
    expect(
      screen.getByRole("button", { name: "시작 화면으로 이동" }),
    ).toBeVisible();
  });
});
