import type { LiveMatchTimelineEvent } from "./types";

export const mockLiveMatchTimelineEvents: LiveMatchTimelineEvent[] = [
  {
    advantage: "blue",
    time: "05:42",
    title: "첫 드래곤",
    body: "T1이 바텀 주도권을 첫 드래곤으로 연결합니다. 아직 골드 차이는 작지만 운영 흐름은 블루 사이드가 먼저 잡았습니다.",
    importance: "medium",
    type: "objective",
  },
  {
    advantage: "blue",
    time: "13:08",
    title: "미드 교전",
    body: "Faker가 미드 2:2 교전에서 선제 킬을 만들어냅니다. 하단 스탯 패널의 KDA와 골드가 동시에 흔들립니다.",
    importance: "high",
    type: "fight",
  },
  {
    advantage: "red",
    time: "23:41",
    title: "바론 앞 시야 싸움",
    body: "Gen.G가 바론 둥지 입구 시야를 걷어내며 한타 구도를 강제로 엽니다. 양 팀의 오브젝트 카운트보다 위치 선정이 더 중요해지는 시간대입니다.",
    importance: "high",
    type: "setup",
  },
  {
    advantage: "blue",
    time: "31:26",
    title: "마지막 한타",
    body: "T1이 장로 앞 한타에서 4킬을 쓸어 담습니다. 곧바로 미드 라인을 밀어붙이며 경기를 끝낼 수 있는 흐름을 만듭니다.",
    importance: "critical",
    type: "finish",
  },
];
