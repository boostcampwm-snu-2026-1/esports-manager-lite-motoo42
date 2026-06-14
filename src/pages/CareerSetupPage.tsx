import { CareerSetup } from "../features/career-setup";
import { useGameDispatch, useGameSelector } from "../app/GameProvider";
import { getPathForRoute } from "../app/routes";
import { gameActions } from "../app/state";
import { listCareerSaves } from "../services/careerSavesApi";
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type CareerSetupPageProps = {
  savePanel?: ReactNode;
};

type SavePresenceStatus = "checking" | "empty" | "has-saves" | "unknown";

export function CareerSetupPage({ savePanel }: CareerSetupPageProps) {
  const dispatch = useGameDispatch();
  const showFirstEntryGuides = useGameSelector(
    (state) => state.appSettings.guides.showFirstEntryGuides,
  );
  const navigate = useNavigate();
  const [savePresenceStatus, setSavePresenceStatus] =
    useState<SavePresenceStatus>("checking");

  useEffect(() => {
    let isMounted = true;

    async function checkSavePresence() {
      try {
        const saves = await listCareerSaves();

        if (isMounted) {
          setSavePresenceStatus(saves.length > 0 ? "has-saves" : "empty");
        }
      } catch {
        if (isMounted) {
          setSavePresenceStatus("unknown");
        }
      }
    }

    void checkSavePresence();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <CareerSetup
      savePanel={savePanel}
      showGameGuideOnEntry={
        showFirstEntryGuides && savePresenceStatus === "empty"
      }
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
