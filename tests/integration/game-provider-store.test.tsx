import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  GameProvider,
  useGameDispatch,
  useGameSelector,
} from "../../src/app/GameProvider";
import { gameActions } from "../../src/app/state";

describe("GameProvider store selectors", () => {
  it("does not rerender dispatch-only consumers after store updates", () => {
    let dispatchOnlyRenders = 0;
    let routeRenders = 0;

    function DispatchOnlyControls() {
      const dispatch = useGameDispatch();
      dispatchOnlyRenders += 1;

      return (
        <>
          <button
            type="button"
            onClick={() => dispatch(gameActions.startCareer("T1"))}
          >
            start
          </button>
          <button
            type="button"
            onClick={() => dispatch(gameActions.setStrategy("aggressive"))}
          >
            set strategy
          </button>
        </>
      );
    }

    function RouteReader() {
      const route = useGameSelector((state) => state.route);
      routeRenders += 1;

      return <div>{route}</div>;
    }

    render(
      <GameProvider>
        <DispatchOnlyControls />
        <RouteReader />
      </GameProvider>,
    );

    const initialDispatchOnlyRenders = dispatchOnlyRenders;
    const initialRouteRenders = routeRenders;

    fireEvent.click(screen.getByRole("button", { name: "start" }));

    expect(screen.getByText("offseason")).toBeInTheDocument();
    expect(dispatchOnlyRenders).toBe(initialDispatchOnlyRenders);
    expect(routeRenders).toBeGreaterThan(initialRouteRenders);

    const routeRendersAfterRouteChange = routeRenders;

    fireEvent.click(screen.getByRole("button", { name: "set strategy" }));

    expect(dispatchOnlyRenders).toBe(initialDispatchOnlyRenders);
    expect(routeRenders).toBe(routeRendersAfterRouteChange);
  });
});
