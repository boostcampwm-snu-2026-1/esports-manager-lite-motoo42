import type { PropsWithChildren } from "react";
import {
  getStrategyLabel,
  getTrainingIntensityLabel,
} from "../../domain/weekly-plan";
import { getSeasonProgressActionLabel } from "../../domain/season";
import type { AppRoute } from "../../app/routes";
import type { CareerSave } from "../../types/game";

type AppShellProps = PropsWithChildren<{
  career: CareerSave | null;
  route: AppRoute;
  onGoTo: (route: AppRoute) => void;
  onProgress: () => void;
}>;

type ShellMenuItem = {
  id: string;
  label: string;
  icon: string;
  route: AppRoute;
  subItems: string[];
};

const shellMenuItems: ShellMenuItem[] = [
  {
    id: "inbox",
    label: "메시지함",
    icon: "✉",
    route: "main-dashboard",
    subItems: ["중요 알림", "뉴스", "일정 알림"],
  },
  {
    id: "roster",
    label: "로스터 관리",
    icon: "▣",
    route: "roster-builder",
    subItems: ["선발 5인", "계약", "2군"],
  },
  {
    id: "training",
    label: "훈련",
    icon: "◆",
    route: "match-week",
    subItems: ["주간 계획", "전략", "훈련 강도"],
  },
  {
    id: "scout",
    label: "스카우트",
    icon: "◎",
    route: "main-dashboard",
    subItems: ["선수 검색", "상대 분석", "관찰 목록"],
  },
  {
    id: "competition",
    label: "대회",
    icon: "◇",
    route: "competition-dashboard",
    subItems: ["LCK Cup", "순위표", "일정/결과", "토너먼트"],
  },
  {
    id: "ranking",
    label: "랭킹",
    icon: "▲",
    route: "season-calendar",
    subItems: ["순위표", "일정", "대회 현황"],
  },
  {
    id: "other",
    label: "기타",
    icon: "⚙",
    route: "season-summary",
    subItems: ["기록", "설정", "시즌 요약"],
  },
];

function getActiveMenuItem(route: AppRoute) {
  if (route === "roster-builder") {
    return shellMenuItems[1];
  }

  if (route === "match-week") {
    return shellMenuItems[2];
  }

  if (route === "competition-dashboard") {
    return shellMenuItems[4];
  }

  if (route === "season-calendar") {
    return shellMenuItems[5];
  }

  if (route === "season-summary") {
    return shellMenuItems[6];
  }

  return shellMenuItems[0];
}

function getActiveCompetitionName(career: CareerSave | null) {
  const activeCompetition = career?.seasonState.competitions.find(
    (competition) => competition.status === "active",
  );
  const currentCompetition = career?.seasonState.competitions.find(
    (competition) =>
      competition.competitionId === career.seasonState.currentCompetitionId,
  );

  if (activeCompetition) {
    return activeCompetition.name;
  }

  if (currentCompetition?.status === "completed") {
    return `${currentCompetition.name} Completed`;
  }

  return currentCompetition?.name ?? "No active competition";
}

export function AppShell({
  children,
  career,
  route,
  onGoTo,
  onProgress,
}: AppShellProps) {
  if (route === "career-setup") {
    return (
      <div className="app-shell app-shell-simple">
        <main className="app-main app-main-simple">{children}</main>
      </div>
    );
  }

  const activeMenuItem = getActiveMenuItem(route);
  const activeCompetitionName = getActiveCompetitionName(career);
  const seasonLabel = career
    ? career.seasonState.currentDateLabel
    : "새 커리어";
  const progressActionLabel = career
    ? getSeasonProgressActionLabel(career.seasonState)
    : "진행";
  const progressDisabled =
    !career || career.seasonState.phase === "stove-league";

  return (
    <div className="app-shell">
      <aside className="shell-sidebar" aria-label="Main navigation">
        <div className="club-mark">{career?.userTeam.name.slice(0, 2).toUpperCase() ?? "LM"}</div>
        <nav className="shell-icon-menu">
          {shellMenuItems.map((item) => (
            <button
              aria-label={item.label}
              className={`shell-menu-button ${
                item.id === activeMenuItem.id ? "shell-menu-button-active" : ""
              }`}
              key={item.id}
              onClick={() => onGoTo(item.route)}
              title={item.label}
              type="button"
            >
              <span>{item.icon}</span>
            </button>
          ))}
        </nav>
      </aside>

      <aside className="shell-submenu">
        <p className="eyebrow">Menu</p>
        <h2>{activeMenuItem.label}</h2>
        <div className="submenu-list">
          {activeMenuItem.subItems.map((item) => (
            <button
              className={`submenu-item ${
                route === activeMenuItem.route ? "submenu-item-active" : ""
              }`}
              key={item}
              onClick={() => onGoTo(activeMenuItem.route)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </aside>

      <div className="shell-content">
        <header className="shell-topbar">
          <div>
            <p className="eyebrow">League Manager</p>
            <h1>{career?.userTeam.name ?? "LoL Manager"}</h1>
          </div>
          <div className="shell-status-strip">
            <span>{seasonLabel}</span>
            <span>{activeCompetitionName}</span>
            {career && (
              <span>
                {getStrategyLabel(career.weeklyPlan.strategy)} /{" "}
                {getTrainingIntensityLabel(career.weeklyPlan.trainingIntensity)}
              </span>
            )}
          </div>
          <button
            className="shell-progress-button"
            disabled={progressDisabled}
            onClick={onProgress}
            type="button"
          >
            {progressActionLabel}
          </button>
        </header>
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
