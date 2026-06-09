import type { Player } from "../types/game";

export type PlayerPortraitMeta = {
  portraitUrl: string;
  portraitSourceUrl: string;
  sourceImageFileName: string;
};

type PlayerPortraitSource = {
  teamName: string;
  playerName: string;
  sourcePageTitle: string;
  sourceImageFileName: string;
};

const portraitSources: PlayerPortraitSource[] = [
  {
    teamName: "Gen.G",
    playerName: "Kiin",
    sourcePageTitle: "Kiin",
    sourceImageFileName: "AFS_Kiin_2018_Spring.png",
  },
  {
    teamName: "Gen.G",
    playerName: "Canyon",
    sourcePageTitle: "Canyon",
    sourceImageFileName: "DWG_Canyon_2019_Split_1.png",
  },
  {
    teamName: "Gen.G",
    playerName: "Chovy",
    sourcePageTitle: "Chovy",
    sourceImageFileName: "GRF_Chovy_2018_Split_1.png",
  },
  {
    teamName: "Gen.G",
    playerName: "Ruler",
    sourcePageTitle: "Ruler",
    sourceImageFileName: "Ruler_Summer_2016.png",
  },
  {
    teamName: "Gen.G",
    playerName: "Duro",
    sourcePageTitle: "Duro",
    sourceImageFileName: "LSB.C_Duro_2022_Split_2.png",
  },
  {
    teamName: "Hanwha Life Esports",
    playerName: "Zeus",
    sourcePageTitle: "Zeus",
    sourceImageFileName: "T1_Zeus_2021_Split_1.png",
  },
  {
    teamName: "Hanwha Life Esports",
    playerName: "Kanavi",
    sourcePageTitle: "Kanavi",
    sourceImageFileName: "GRF_Kanavi_2019_Split_1.png",
  },
  {
    teamName: "Hanwha Life Esports",
    playerName: "Zeka",
    sourcePageTitle: "Zeka (Kim Geon-woo)",
    sourceImageFileName: "VG_Zeka_2020_Split_1.png",
  },
  {
    teamName: "Hanwha Life Esports",
    playerName: "Gumayusi",
    sourcePageTitle: "Gumayusi",
    sourceImageFileName: "T1_Gumayusi_2020_Split_1.png",
  },
  {
    teamName: "Hanwha Life Esports",
    playerName: "Delight",
    sourcePageTitle: "Delight",
    sourceImageFileName: "BRO_Delight_2021_Split_1.png",
  },
  {
    teamName: "Hanwha Life Esports",
    playerName: "Bluffing",
    sourcePageTitle: "Bluffing",
    sourceImageFileName: "HLE.C_Bluffing_2025_Split_1.png",
  },
  {
    teamName: "T1",
    playerName: "Doran",
    sourcePageTitle: "Doran (Choi Hyeon-joon)",
    sourceImageFileName: "GRF_Doran_2019_Split_2.png",
  },
  {
    teamName: "T1",
    playerName: "Oner",
    sourcePageTitle: "Oner",
    sourceImageFileName: "T1_Oner_2021_Split_1.png",
  },
  {
    teamName: "T1",
    playerName: "Faker",
    sourcePageTitle: "Faker",
    sourceImageFileName: "Faker2014.jpg",
  },
  {
    teamName: "T1",
    playerName: "Peyz",
    sourcePageTitle: "Peyz",
    sourceImageFileName: "GEN.C_Peyz_2022_Split_1.png",
  },
  {
    teamName: "T1",
    playerName: "Keria",
    sourcePageTitle: "Keria",
    sourceImageFileName: "DRX_Keria_2020_Split_1.png",
  },
  {
    teamName: "KT Rolster",
    playerName: "PerfecT",
    sourcePageTitle: "PerfecT (Lee Seung-min)",
    sourceImageFileName: "KT.C_PerfecT_2023_Split_2.png",
  },
  {
    teamName: "KT Rolster",
    playerName: "Cuzz",
    sourcePageTitle: "Cuzz",
    sourceImageFileName: "LZ_Cuzz_2017_Summer.png",
  },
  {
    teamName: "KT Rolster",
    playerName: "Bdd",
    sourcePageTitle: "Bdd",
    sourceImageFileName: "CJ_Bdd_2016_Spring.png",
  },
  {
    teamName: "KT Rolster",
    playerName: "Aiming",
    sourcePageTitle: "Aiming",
    sourceImageFileName: "AFS_Aiming_2018_Spring.png",
  },
  {
    teamName: "KT Rolster",
    playerName: "FenRir",
    sourcePageTitle: "FenRir (Park Kang-jun)",
    sourceImageFileName: "KT.C_FenRir_2026_Split_1.png",
  },
  {
    teamName: "KT Rolster",
    playerName: "Effort",
    sourcePageTitle: "Effort",
    sourceImageFileName: "SKT_Effort_2018_Spring.png",
  },
  {
    teamName: "Dplus KIA",
    playerName: "Siwoo",
    sourcePageTitle: "Siwoo",
    sourceImageFileName: "DK.C_Siwoo_2024_Split_1.png",
  },
  {
    teamName: "Dplus KIA",
    playerName: "Lucid",
    sourcePageTitle: "Lucid (Choi Yong-hyeok)",
    sourceImageFileName: "DK.C_Lucid_2021_Split_2.png",
  },
  {
    teamName: "Dplus KIA",
    playerName: "ShowMaker",
    sourcePageTitle: "ShowMaker",
    sourceImageFileName: "DWG_ShowMaker_2018_Split_1.png",
  },
  {
    teamName: "Dplus KIA",
    playerName: "Smash",
    sourcePageTitle: "Smash (Shin Geum-jae)",
    sourceImageFileName: "T1.C_Smash_2023_Split_1.png",
  },
  {
    teamName: "Dplus KIA",
    playerName: "Career",
    sourcePageTitle: "Career",
    sourceImageFileName: "DRX.C_Career_2023_Split_2.png",
  },
  {
    teamName: "Hanjin BRION",
    playerName: "Casting",
    sourcePageTitle: "Casting",
    sourceImageFileName: "GEN.GA_Casting_2023_Split_1.png",
  },
  {
    teamName: "Hanjin BRION",
    playerName: "Gideon",
    sourcePageTitle: "GIDEON",
    sourceImageFileName: "GRF_GIDEON_2020_Split_1.png",
  },
  {
    teamName: "Hanjin BRION",
    playerName: "Loki",
    sourcePageTitle: "Loki (Lee Sang-min)",
    sourceImageFileName: "HLE.C_Loki_2022_Split_2.png",
  },
  {
    teamName: "Hanjin BRION",
    playerName: "Roamer",
    sourcePageTitle: "Roamer",
    sourceImageFileName: "BRO.C_Roamer_2021_Split_1.png",
  },
  {
    teamName: "Hanjin BRION",
    playerName: "Teddy",
    sourcePageTitle: "Teddy",
    sourceImageFileName: "JAG_Teddy_2017_Spring.png",
  },
  {
    teamName: "Hanjin BRION",
    playerName: "Namgung",
    sourcePageTitle: "Namgung",
    sourceImageFileName: "GEN.GA_Namgung_2024_Split_1.png",
  },
  {
    teamName: "BNK FEARX",
    playerName: "Clear",
    sourcePageTitle: "Clear (Song Hyeon-min)",
    sourceImageFileName: "DRX.C_Clear_2021_Split_1.png",
  },
  {
    teamName: "BNK FEARX",
    playerName: "Raptor",
    sourcePageTitle: "Raptor (Jeon Eo-jin)",
    sourceImageFileName: "BRO.C_Raptor_2023_Split_2.png",
  },
  {
    teamName: "BNK FEARX",
    playerName: "VicLa",
    sourcePageTitle: "VicLa",
    sourceImageFileName: "KT.C_VicLa_2021_Split_1.png",
  },
  {
    teamName: "BNK FEARX",
    playerName: "Daystar",
    sourcePageTitle: "Daystar",
    sourceImageFileName: "TB_Daystar_2023_Split_2.png",
  },
  {
    teamName: "BNK FEARX",
    playerName: "Slayer",
    sourcePageTitle: "Slayer (Kim Jin-young)",
    sourceImageFileName: "GEN.GA_Slayer_2024_Split_1.png",
  },
  {
    teamName: "BNK FEARX",
    playerName: "Kellin",
    sourcePageTitle: "Kellin",
    sourceImageFileName: "JAG_Kellin_2019_Split_2.png",
  },
  {
    teamName: "Nongshim RedForce",
    playerName: "Kingen",
    sourcePageTitle: "Kingen",
    sourceImageFileName: "KT_Kingen_2018_WC.png",
  },
  {
    teamName: "Nongshim RedForce",
    playerName: "Sponge",
    sourcePageTitle: "Sponge",
    sourceImageFileName: "DRX.C_Sponge_2022_Split_2.png",
  },
  {
    teamName: "Nongshim RedForce",
    playerName: "Scout",
    sourcePageTitle: "Scout",
    sourceImageFileName: "SKT_Scout_2016_Spring.png",
  },
  {
    teamName: "Nongshim RedForce",
    playerName: "Taeyoon",
    sourcePageTitle: "Taeyoon (Kim Tae-yoon)",
    sourceImageFileName: "DRX.C_Taeyoon_2021_Split_1.png",
  },
  {
    teamName: "Nongshim RedForce",
    playerName: "Diable",
    sourcePageTitle: "Diable",
    sourceImageFileName: "LSB.Y_Diable_2023_Split_2.png",
  },
  {
    teamName: "Nongshim RedForce",
    playerName: "Lehends",
    sourcePageTitle: "Lehends",
    sourceImageFileName: "BPZ_Lehends_2017_Spring.png",
  },
  {
    teamName: "Nongshim RedForce",
    playerName: "Pleata",
    sourcePageTitle: "Pleata",
    sourceImageFileName: "DRX_Becca_2021_Split_1.png",
  },
  {
    teamName: "Kiwoom DRX",
    playerName: "Rich",
    sourcePageTitle: "Rich (Lee Jae-won)",
    sourceImageFileName: "GEN_Rich_2019_Split_2.png",
  },
  {
    teamName: "Kiwoom DRX",
    playerName: "Willer",
    sourcePageTitle: "Willer",
    sourceImageFileName: "HLE.C_Willer_2021_Split_2.png",
  },
  {
    teamName: "Kiwoom DRX",
    playerName: "Ucal",
    sourcePageTitle: "Ucal",
    sourceImageFileName: "KT_UcaL_2018_Spring.png",
  },
  {
    teamName: "Kiwoom DRX",
    playerName: "Jiwoo",
    sourcePageTitle: "Jiwoo",
    sourceImageFileName: "NS.A_Jiwoo_2023_Split_1.png",
  },
  {
    teamName: "Kiwoom DRX",
    playerName: "LazyFeel",
    sourcePageTitle: "LazyFeel",
    sourceImageFileName: "DRX_LazyFeel.jpg",
  },
  {
    teamName: "Kiwoom DRX",
    playerName: "Andil",
    sourcePageTitle: "Andil",
    sourceImageFileName: "NSR_Poibos_2021_Split_1.png",
  },
  {
    teamName: "DN SOOPers",
    playerName: "DuDu",
    sourcePageTitle: "DuDu (Lee Dong-ju)",
    sourceImageFileName: "HLE_DuDu_2020_Split_2.png",
  },
  {
    teamName: "DN SOOPers",
    playerName: "Pyosik",
    sourcePageTitle: "Pyosik",
    sourceImageFileName: "DRX_Pyosik_2020_Split_1.png",
  },
  {
    teamName: "DN SOOPers",
    playerName: "DDoiV",
    sourcePageTitle: "DDoiV",
    sourceImageFileName: "BRO.C_DDoiV_2023_Split_2.png",
  },
  {
    teamName: "DN SOOPers",
    playerName: "Clozer",
    sourcePageTitle: "Clozer",
    sourceImageFileName: "T1_Clozer_2020_Split_2.png",
  },
  {
    teamName: "DN SOOPers",
    playerName: "deokdam",
    sourcePageTitle: "Deokdam",
    sourceImageFileName: "DYN_Feiz_2019_Split_2.png",
  },
  {
    teamName: "DN SOOPers",
    playerName: "Enosh",
    sourcePageTitle: "Enosh",
    sourceImageFileName: "BRO.C_Enosh_2023_Split_2.png",
  },
  {
    teamName: "DN SOOPers",
    playerName: "Peter",
    sourcePageTitle: "Peter (Jeong Yoon-su)",
    sourceImageFileName: "NS.C_Peter_2021_Split_2.png",
  },
  {
    teamName: "DN SOOPers",
    playerName: "Life",
    sourcePageTitle: "Life",
    sourceImageFileName: "GEN_Life_2018_Split_2.png",
  },
  {
    teamName: "DN SOOPers",
    playerName: "Quantum",
    sourcePageTitle: "Quantum (Son Jeong-hwan)",
    sourceImageFileName: "KDF.C_Quantum_2024_Split_1.png",
  },
];

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getPortraitKey(teamName: string | undefined, playerName: string) {
  return `${teamName ?? ""}::${playerName}`.toLowerCase();
}

function getSourcePageUrl(sourcePageTitle: string) {
  return `https://lol.fandom.com/wiki/${encodeURIComponent(sourcePageTitle).replace(
    /%20/g,
    "_",
  )}`;
}

function createPortraitMeta(source: PlayerPortraitSource): PlayerPortraitMeta {
  const teamSlug = createSlug(source.teamName);
  const playerSlug = createSlug(source.playerName);

  return {
    portraitUrl: `/assets/players/lck/2026/main/${teamSlug}-${playerSlug}.webp`,
    portraitSourceUrl: getSourcePageUrl(source.sourcePageTitle),
    sourceImageFileName: source.sourceImageFileName,
  };
}

export const lck2026PlayerPortraits: Record<string, PlayerPortraitMeta> =
  Object.fromEntries(
    portraitSources.map((source) => [
      `lck-2026-${createSlug(source.teamName)}-${createSlug(source.playerName)}`,
      createPortraitMeta(source),
    ]),
  );

const portraitByTeamAndName = new Map(
  portraitSources.map((source) => [
    getPortraitKey(source.teamName, source.playerName),
    createPortraitMeta(source),
  ]),
);

export function getLck2026PlayerPortrait(
  player: Pick<Player, "currentTeam" | "id" | "name">,
) {
  return (
    lck2026PlayerPortraits[player.id] ??
    portraitByTeamAndName.get(getPortraitKey(player.currentTeam, player.name))
  );
}

export const lck2026MainPortraitCount = portraitSources.length;
