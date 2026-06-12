import type { ReactNode } from "react";
import type { AppRoute, RouteSubPage } from "../../app/routes";
import type { CompetitionId } from "../../types/game";

export type ShellMenuIconId =
  | "home"
  | "inbox"
  | "roster"
  | "training"
  | "competition"
  | "calendar"
  | "offseason"
  | "teams"
  | "save"
  | "summary"
  | "settings";

export type ShellMenuItem = {
  id: string;
  label: string;
  icon: ShellMenuIconId;
  route: AppRoute;
  subItems: string[];
};

export type ShellMenuGroup = {
  id: string;
  label: string;
  items: ShellMenuItem[];
};

export type ShellSubMenuItem = {
  id: string;
  label: string;
  route: AppRoute;
  competitionId?: CompetitionId | null;
  subPage?: RouteSubPage | null;
  hash?: string | null;
  isDefault?: boolean;
};

export function ShellMenuIcon({ icon }: { icon: ShellMenuIconId }) {
  const commonProps = {
    "aria-hidden": true,
    fill: "none",
    focusable: false,
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2,
    viewBox: "0 0 24 24",
  };

  const paths: Record<ShellMenuIconId, ReactNode> = {
    home: (
      <>
        <path d="M4 11.5 12 4l8 7.5" />
        <path d="M6.5 10.5V20h11v-9.5" />
        <path d="M10 20v-5h4v5" />
      </>
    ),
    inbox: (
      <>
        <path d="M4 6h16v12H4z" />
        <path d="m4 8 8 6 8-6" />
      </>
    ),
    roster: (
      <>
        <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M3.5 20a4.5 4.5 0 0 1 9 0" />
        <path d="M15 8h5" />
        <path d="M15 13h5" />
        <path d="M15 18h5" />
      </>
    ),
    training: (
      <>
        <path d="M12 3v4" />
        <path d="M12 17v4" />
        <path d="M3 12h4" />
        <path d="M17 12h4" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" />
      </>
    ),
    competition: (
      <>
        <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
        <path d="M8 6H5a3 3 0 0 0 3 5" />
        <path d="M16 6h3a3 3 0 0 1-3 5" />
        <path d="M12 12v4" />
        <path d="M9 20h6" />
        <path d="M10 16h4v4h-4z" />
      </>
    ),
    calendar: (
      <>
        <path d="M5 5h14v15H5z" />
        <path d="M8 3v4" />
        <path d="M16 3v4" />
        <path d="M5 9h14" />
        <path d="M8 13h2" />
        <path d="M14 13h2" />
        <path d="M8 17h2" />
      </>
    ),
    offseason: (
      <>
        <path d="M7 7h10" />
        <path d="m15 4 3 3-3 3" />
        <path d="M17 17H7" />
        <path d="m9 14-3 3 3 3" />
      </>
    ),
    teams: (
      <>
        <path d="M12 3 5 6v5c0 4.5 3 7.5 7 10 4-2.5 7-5.5 7-10V6l-7-3Z" />
        <path d="M9 12h6" />
        <path d="M12 9v6" />
      </>
    ),
    save: (
      <>
        <path d="M5 4h12l2 2v14H5z" />
        <path d="M8 4v6h8V4" />
        <path d="M8 20v-6h8v6" />
      </>
    ),
    summary: (
      <>
        <path d="M6 4h12v16H6z" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
        <path d="M9 16h3" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v3" />
        <path d="M12 18v3" />
        <path d="M3 12h3" />
        <path d="M18 12h3" />
        <path d="m5.6 5.6 2.1 2.1" />
        <path d="m16.3 16.3 2.1 2.1" />
        <path d="m18.4 5.6-2.1 2.1" />
        <path d="m7.7 16.3-2.1 2.1" />
      </>
    ),
  };

  return <svg {...commonProps}>{paths[icon]}</svg>;
}

export function formatShellBadgeCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

export const shellMenuGroups: ShellMenuGroup[] = [
  {
    id: "management",
    label: "관리",
    items: [
      {
        id: "home",
        label: "홈",
        icon: "home",
        route: "main-dashboard",
        subItems: [],
      },
      {
        id: "inbox",
        label: "메시지함",
        icon: "inbox",
        route: "inbox",
        subItems: ["전체", "중요", "일정", "이적"],
      },
      {
        id: "roster",
        label: "로스터 관리",
        icon: "roster",
        route: "roster-builder",
        subItems: ["선발 5인", "2군", "계약"],
      },
      {
        id: "training",
        label: "전략 / 훈련",
        icon: "training",
        route: "match-week",
        subItems: ["주간 계획", "전략", "훈련 강도"],
      },
    ],
  },
  {
    id: "season",
    label: "시즌",
    items: [
      {
        id: "competition",
        label: "대회 현황",
        icon: "competition",
        route: "competition-dashboard",
        subItems: [],
      },
      {
        id: "calendar",
        label: "시즌 캘린더",
        icon: "calendar",
        route: "season-calendar",
        subItems: ["로드맵", "월간 달력", "대회 일정"],
      },
      {
        id: "offseason",
        label: "스토브리그",
        icon: "offseason",
        route: "offseason",
        subItems: ["시장 개요", "FA 명단", "일정 안내", "이적 로그"],
      },
      {
        id: "lck-team-info",
        label: "LCK 구단 정보",
        icon: "teams",
        route: "lck-team-info",
        subItems: [],
      },
    ],
  },
  {
    id: "system",
    label: "시스템",
    items: [
      {
        id: "save",
        label: "데이터 저장",
        icon: "save",
        route: "save-manager",
        subItems: [],
      },
      {
        id: "other",
        label: "시즌 결산",
        icon: "summary",
        route: "season-summary",
        subItems: [],
      },
      {
        id: "settings",
        label: "설정",
        icon: "settings",
        route: "settings",
        subItems: [],
      },
    ],
  },
];

const shellMenuItems = shellMenuGroups.flatMap((group) => group.items);

function getMenuItemById(id: string) {
  return shellMenuItems.find((item) => item.id === id) ?? shellMenuItems[0];
}

export function getActiveMenuItem(route: AppRoute) {
  if (route === "roster-builder") {
    return getMenuItemById("roster");
  }

  if (route === "match-week") {
    return getMenuItemById("training");
  }

  if (route === "inbox") {
    return getMenuItemById("inbox");
  }

  if (route === "competition-dashboard") {
    return getMenuItemById("competition");
  }

  if (route === "season-calendar") {
    return getMenuItemById("calendar");
  }

  if (route === "season-summary") {
    return getMenuItemById("other");
  }

  if (route === "offseason") {
    return getMenuItemById("offseason");
  }

  if (route === "lck-team-info") {
    return getMenuItemById("lck-team-info");
  }

  if (route === "save-manager") {
    return getMenuItemById("save");
  }

  if (route === "settings") {
    return getMenuItemById("settings");
  }

  return getMenuItemById("home");
}
