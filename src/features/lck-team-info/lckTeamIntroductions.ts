export type LckTeamIntroduction = {
  summary: string;
  description: string;
};

export const lckTeamIntroductions: Record<string, LckTeamIntroduction> = {
  "gen-g": {
    summary: "정교한 운영과 우승권 기준을 상징하는 강팀.",
    description:
      "Gen.G는 LCK 정상권에서 완성도 높은 경기력을 쌓아온 구단입니다. 정교한 운영과 안정적인 정규시즌 흐름으로 리그의 우승권 기준을 보여주는 팀입니다.",
  },
  "hanwha-life-esports": {
    summary: "큰 투자와 스타 파워로 정상에 도전하는 구단.",
    description:
      "Hanwha Life Esports는 큰 투자를 바탕으로 스타 플레이어를 모아 정상에 도전하는 구단입니다. 강한 이름값과 높은 기대를 함께 짊어진 팀으로, 매 시즌 우승 경쟁의 중심에 서려 합니다.",
  },
  t1: {
    summary: "LCK와 국제대회 역사를 대표하는 명문 구단.",
    description:
      "T1은 LCK와 국제대회 역사를 대표하는 명문 구단입니다. 수많은 우승과 상징적인 선수들로 리그의 기준점 역할을 해온 팀입니다.",
  },
  "kt-rolster": {
    summary: "통신사 라이벌리와 뜨거운 팬덤을 가진 전통의 구단.",
    description:
      "KT Rolster는 오래된 통신사 라이벌리와 뜨거운 팬덤을 가진 전통의 구단입니다. 중요한 순간마다 강팀을 위협해온 도전자라는 서사를 이어갑니다.",
  },
  "dplus-kia": {
    summary: "성장 서사와 국제대회 영광이 공존하는 구단.",
    description:
      "Dplus KIA는 담원 시절부터 이어진 성장 서사와 국제대회 영광을 가진 팀입니다. 젊은 에너지와 우승 경험이 공존하는 구단으로 다시 한 번 정상권을 바라봅니다.",
  },
  "nongshim-redforce": {
    summary: "도전자의 위치에서 리그에 균열을 만들어온 팀.",
    description:
      "Nongshim RedForce는 꾸준히 도전자의 위치에서 리그에 균열을 만들어온 팀입니다. 경험 있는 선수와 성장형 자원이 함께 기회를 노립니다.",
  },
  "hanjin-brion": {
    summary: "끈질긴 경기와 언더독 서사를 가진 구단.",
    description:
      "Hanjin BRION은 끈질긴 경기와 언더독 서사를 가진 구단입니다. 낮은 기대 속에서도 한 경기 한 경기 반전을 노리는 팀입니다.",
  },
  "bnk-fearx": {
    summary: "젊은 색채와 새로운 도전을 앞세우는 구단.",
    description:
      "BNK FEARX는 젊은 색채와 새로운 도전을 앞세우는 구단입니다. 이름과 정체성을 바꿔가며 리그 안에서 자기 자리를 넓혀가는 팀입니다.",
  },
  "kiwoom-drx": {
    summary: "Worlds 우승의 기억을 품은 재건의 구단.",
    description:
      "Kiwoom DRX는 Worlds 우승의 기억을 품은 구단입니다. 재건의 흐름 속에서도 큰 무대의 흔적과 반등의 가능성을 함께 가진 팀입니다.",
  },
  "dn-soopers": {
    summary: "새로운 이름으로 출발선을 다시 잡은 팀.",
    description:
      "DN SOOPers는 새로운 이름으로 출발선을 다시 잡은 팀입니다. 낮은 기대치에서 시작하지만, 리그 안에 새로운 서사를 만들 여지가 있는 구단입니다.",
  },
};

export function getLckTeamIntroduction(teamId: string): LckTeamIntroduction {
  return (
    lckTeamIntroductions[teamId] ?? {
      summary: "LCK 시즌을 함께 만들어가는 구단.",
      description:
        "LCK 무대에서 자신만의 서사를 쌓아가는 구단입니다. 시즌 흐름에 따라 전통과 기록이 새롭게 갱신됩니다.",
    }
  );
}
