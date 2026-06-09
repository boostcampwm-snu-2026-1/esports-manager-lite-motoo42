import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
} from "react";
import { useNavigate } from "react-router-dom";
import { SaveManager, type AutoSaveStatus } from "../../features/save-manager";
import {
  createCareerSave,
  isSaveConflictError,
  updateCareerSave,
  type CareerSaveDto,
} from "../../services/careerSavesApi";
import type { CareerSave } from "../../types/game";
import {
  getAutosaveName,
  getCareerAutoSaveCheckpoint,
} from "../autoSaveCheckpoint";
import { getPathForRoute, type AppRoute } from "../routes";
import { gameActions, type GameAction } from "../state";

type ActiveSaveMeta = {
  id: string;
  revision: number | null;
  saveName: string;
};

type PendingAutoSave = {
  career: CareerSave;
  reason: "checkpoint" | "initial";
};

function getRouteForLoadedCareer(career: CareerSave): AppRoute {
  if (career.seasonState.phase === "completed") {
    return "season-summary";
  }

  if (career.seasonState.phase === "offseason") {
    const offseasonStatus = career.seasonState.offseason?.status;

    return offseasonStatus === "active" || offseasonStatus === "ready-for-next-season"
      ? "offseason"
      : "season-summary";
  }

  return "main-dashboard";
}

function toActiveSaveMeta(save: CareerSaveDto): ActiveSaveMeta {
  return {
    id: save.id,
    revision: save.revision,
    saveName: save.saveName,
  };
}

function getAutoSaveFailureStatus(error: unknown): AutoSaveStatus {
  if (isSaveConflictError(error)) {
    return {
      kind: "conflict",
      message: "저장 충돌: 새로고침 필요",
    };
  }

  if (error instanceof TypeError) {
    return {
      kind: "failed",
      message: "저장 서버 대기",
    };
  }

  return {
    kind: "failed",
    message: "자동 저장 실패",
  };
}

export function useAutoSaveController({
  career,
  dispatch,
  disabled,
  isProgressing,
}: {
  career: CareerSave | null;
  dispatch: Dispatch<GameAction>;
  disabled: boolean;
  isProgressing: boolean;
}) {
  const navigate = useNavigate();
  const [activeSaveMeta, setActiveSaveMeta] = useState<ActiveSaveMeta | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>({
    kind: "idle",
    message: "자동 저장 대기",
  });
  const [lastCommittedSave, setLastCommittedSave] =
    useState<CareerSaveDto | null>(null);
  const activeSaveMetaRef = useRef<ActiveSaveMeta | null>(null);
  const autoSaveInFlightRef = useRef(false);
  const lastAutoSaveCheckpointRef = useRef<string | null>(null);
  const pendingAutoSaveRef = useRef<PendingAutoSave | null>(null);
  const skipNextAutoSaveRef = useRef(false);
  const autoSaveCheckpoint = useMemo(
    () => (career ? getCareerAutoSaveCheckpoint(career) : null),
    [career],
  );

  useEffect(() => {
    activeSaveMetaRef.current = activeSaveMeta;
  }, [activeSaveMeta]);

  const handleSaveCommitted = useCallback((save: CareerSaveDto) => {
    const nextMeta = toActiveSaveMeta(save);

    activeSaveMetaRef.current = nextMeta;
    setActiveSaveMeta(nextMeta);
    setLastCommittedSave(save);
  }, []);

  const handleActiveSaveChange = useCallback((saveId: string | null) => {
    setActiveSaveMeta((currentMeta) => {
      if (!saveId) {
        activeSaveMetaRef.current = null;
        return null;
      }

      const nextMeta =
        currentMeta?.id === saveId
          ? currentMeta
          : { id: saveId, revision: null, saveName: "" };

      activeSaveMetaRef.current = nextMeta;
      return nextMeta;
    });
  }, []);

  const requestAutoSave = useCallback(
    async (nextCareer: CareerSave, reason: PendingAutoSave["reason"]) => {
      if (autoSaveInFlightRef.current) {
        pendingAutoSaveRef.current = { career: nextCareer, reason };
        return;
      }

      autoSaveInFlightRef.current = true;
      setAutoSaveStatus({
        kind: "saving",
        message: reason === "initial" ? "첫 저장 생성 중" : "자동 저장 중",
      });

      try {
        const activeSave = activeSaveMetaRef.current;
        const save = activeSave?.id
          ? await updateCareerSave({
              career: nextCareer,
              expectedRevision: activeSave.revision,
              saveId: activeSave.id,
              saveName: activeSave.saveName || getAutosaveName(nextCareer),
            })
          : await createCareerSave({
              career: nextCareer,
              saveName: getAutosaveName(nextCareer),
            });

        handleSaveCommitted(save);
        setAutoSaveStatus({
          kind: "saved",
          message: reason === "initial" ? "첫 저장 완료" : "자동 저장 완료",
        });
      } catch (error) {
        setAutoSaveStatus(getAutoSaveFailureStatus(error));
      } finally {
        autoSaveInFlightRef.current = false;

        if (pendingAutoSaveRef.current) {
          const nextAutoSave = pendingAutoSaveRef.current;

          pendingAutoSaveRef.current = null;
          void requestAutoSave(nextAutoSave.career, nextAutoSave.reason);
        }
      }
    },
    [handleSaveCommitted],
  );

  const handleLoadCareer = useCallback(
    (loadedCareer: CareerSave, saveId: string) => {
      const route = getRouteForLoadedCareer(loadedCareer);

      handleActiveSaveChange(saveId);
      skipNextAutoSaveRef.current = true;
      dispatch(gameActions.loadCareer(loadedCareer));
      navigate(getPathForRoute(route));
    },
    [dispatch, handleActiveSaveChange, navigate],
  );

  useEffect(() => {
    if (!career || !autoSaveCheckpoint || isProgressing) {
      return;
    }

    if (skipNextAutoSaveRef.current) {
      skipNextAutoSaveRef.current = false;
      lastAutoSaveCheckpointRef.current = autoSaveCheckpoint;
      return;
    }

    if (lastAutoSaveCheckpointRef.current === autoSaveCheckpoint) {
      return;
    }

    const reason = lastAutoSaveCheckpointRef.current ? "checkpoint" : "initial";

    lastAutoSaveCheckpointRef.current = autoSaveCheckpoint;
    void requestAutoSave(career, reason);
  }, [autoSaveCheckpoint, career, isProgressing, requestAutoSave]);

  useEffect(() => {
    if (career) {
      return;
    }

    activeSaveMetaRef.current = null;
    lastAutoSaveCheckpointRef.current = null;
    pendingAutoSaveRef.current = null;
    setActiveSaveMeta(null);
    setLastCommittedSave(null);
    setAutoSaveStatus({ kind: "idle", message: "자동 저장 대기" });
  }, [career]);

  const savePanel = (
    <SaveManager
      activeSaveId={activeSaveMeta?.id ?? null}
      activeSaveRevision={activeSaveMeta?.revision ?? null}
      autoSaveStatus={autoSaveStatus}
      career={career}
      committedSave={lastCommittedSave}
      disabled={disabled}
      onActiveSaveChange={handleActiveSaveChange}
      onLoadCareer={handleLoadCareer}
      onSaveCommitted={handleSaveCommitted}
      variant="panel"
    />
  );

  return {
    autoSaveStatus,
    savePanel,
  };
}
