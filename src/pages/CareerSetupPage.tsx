import { CareerSetup } from "../features/career-setup";
import { useGameDispatch } from "../app/GameProvider";
import { getPathForRoute } from "../app/routes";
import { gameActions } from "../app/state";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type CareerSetupPageProps = {
  savePanel?: ReactNode;
};

export function CareerSetupPage({ savePanel }: CareerSetupPageProps) {
  const dispatch = useGameDispatch();
  const navigate = useNavigate();

  return (
    <CareerSetup
      savePanel={savePanel}
      onStart={(teamName, startMode) => {
        dispatch(gameActions.startCareer(teamName, startMode));
        navigate(
          getPathForRoute(
            startMode === "real-roster-lck-cup"
              ? "main-dashboard"
              : "offseason",
          ),
        );
      }}
    />
  );
}
