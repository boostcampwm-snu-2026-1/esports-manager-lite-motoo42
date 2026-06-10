import type { Competition, SeasonTemplate } from "../types/game";

const lckCup: Competition = {
  id: "lck-cup",
  name: "LCK Cup",
  scope: "lck",
  order: 1,
  calendarType: "both",
  qualificationRule: "LCK Cup result decides the LCK First Stand representatives.",
  formatSummary:
    "Baron/Elder Group Battle, Super Week BO5, Play-In, and Playoffs decide the first domestic champion.",
  entrantsSummary: "LCK 10 teams",
  stages: [
    {
      name: "Group Battle",
      format: "Baron Group and Elder Group play cross-group series.",
      notes: "Regular group battle wins are worth 1 point.",
    },
    {
      name: "Super Week",
      format: "Same selection-rank teams meet in fixed BO5 matches.",
      notes: "Super Week wins are worth 2 points and shape Play-In/Playoffs seeding.",
    },
    {
      name: "Play-In / Playoffs",
      format: "Cup seeding leads into BO5 postseason matches.",
      notes: "The winner and runner-up become the LCK First Stand representatives.",
    },
  ],
  status: "available",
};

const firstStand: Competition = {
  id: "first-stand",
  name: "First Stand",
  scope: "international",
  order: 2,
  calendarType: "both",
  qualificationRule:
    "LCK top 2, LPL top 2, and one team each from the 3rd-6th ranked leagues.",
  formatSummary:
    "Eight teams begin in two BO1 groups, then the top four enter a BO5 knockout bracket.",
  entrantsSummary:
    "LCK 2, LPL 2, other 3rd-6th ranked leagues 1 each, total 8 teams.",
  stages: [
    {
      name: "Group Stage",
      format: "Two groups of four teams.",
      entrants: 8,
      advancing: 4,
      notes: "Top two teams from each group advance to the knockout bracket.",
    },
    {
      name: "Semifinals and Final",
      format: "Four-team knockout bracket.",
      entrants: 4,
      advancing: 1,
      notes: "Semifinals and final are played as BO5 series.",
    },
  ],
  status: "locked",
};

const lckRounds12: Competition = {
  id: "lck-rounds-1-2",
  name: "LCK Rounds 1-2",
  scope: "lck",
  order: 3,
  calendarType: "both",
  qualificationRule: "Determines MSI qualification and later LCK seeding.",
  formatSummary:
    "Full LCK double round robin followed by Road to MSI postseason qualification.",
  entrantsSummary: "LCK 10 teams",
  stages: [
    {
      name: "Rounds 1-2 regular stage",
      format: "Double round robin, 90 total series, team spacing constrained to LCK match days.",
      notes: "The table is later carried into the post-MSI LCK phase.",
    },
    {
      name: "Road to MSI / postseason",
      format: "Postseason bracket decides the LCK MSI representatives.",
      notes: "Final placements also influence later domestic seeding.",
    },
  ],
  status: "locked",
};

const msi: Competition = {
  id: "msi",
  name: "MSI",
  scope: "international",
  order: 4,
  calendarType: "both",
  qualificationRule:
    "Top two teams from each major league except CBLOL, plus the CBLOL champion. First Stand winner league grants its second seed a bracket bye.",
  formatSummary:
    "11-team 2026 MSI format with a small Play-In and an eight-team upper/lower bracket stage.",
  entrantsSummary:
    "LCK 2, LPL 2, LEC 2, LCS 2, LCP 2, CBLOL 1, total 11 teams.",
  stages: [
    {
      name: "Play-In Stage",
      format: "Four-team single elimination.",
      entrants: 4,
      advancing: 1,
      notes: "The Play-In winner joins seven direct bracket-stage teams.",
    },
    {
      name: "Bracket Stage",
      format: "Eight-team upper/lower bracket double elimination.",
      entrants: 8,
      advancing: 1,
      notes: "MSI final placement also awards Worlds bonus seeds to the top two leagues.",
    },
  ],
  status: "locked",
};

const lckRounds35: Competition = {
  id: "lck-rounds-3-5",
  name: "LCK Rounds 3-5",
  scope: "lck",
  order: 5,
  calendarType: "normal",
  qualificationRule: "Determines Worlds qualification.",
  formatSummary:
    "Normal-season path after MSI: Legend/Rise groups, continued standings, and Worlds qualification playoffs.",
  entrantsSummary: "LCK 10 teams",
  stages: [
    {
      name: "Rounds 3-5 regular stage",
      format: "Legend and Rise groups play internal regular-season series.",
      notes: "Each match day pairs one Legend match with one Rise match when two series are scheduled.",
    },
    {
      name: "LCK Playoffs",
      format: "Postseason bracket determines Worlds seeds.",
      notes: "Final LCK placements feed into the Worlds 20-team entrant pool.",
    },
  ],
  status: "locked",
};

const lckRounds34: Competition = {
  id: "lck-rounds-3-4",
  name: "LCK Rounds 3-4",
  scope: "lck",
  order: 5,
  calendarType: "asian-games",
  qualificationRule: "Determines Worlds qualification path in Asian Games seasons.",
  formatSummary:
    "Asian Games season path: post-MSI LCK play is shortened to Rounds 3-4 before the national-team event.",
  entrantsSummary: "LCK 10 teams",
  stages: [
    {
      name: "Rounds 3-4 regular stage",
      format: "Legend and Rise groups play a shortened internal regular stage.",
      notes: "The shortened phase preserves Worlds qualification before Asian Games.",
    },
    {
      name: "LCK Playoffs",
      format:
        "Season Play-In followed by upper/lower bracket LCK Playoffs, all BO5 Fearless.",
      notes:
        "Final 1-3 are basic Worlds candidates; final 4th is kept for MSI extra-seed scenarios.",
    },
  ],
  status: "locked",
};

const asianGames: Competition = {
  id: "asian-games",
  name: "Asian Games",
  scope: "special",
  order: 6,
  calendarType: "asian-games",
  qualificationRule: "National team selection from the LCK player pool.",
  formatSummary:
    "Special eight-country national-team event inserted before Worlds in Asian Games seasons.",
  entrantsSummary: "National teams",
  stages: [
    {
      name: "National team event",
      format: "Eight-team knockout event with Korea selected from the LCK player pool.",
      notes: "The user can choose direct control or automatic national-team progression.",
    },
  ],
  status: "locked",
};

const worldsNormal: Competition = {
  id: "worlds",
  name: "Worlds",
  scope: "international",
  order: 6,
  calendarType: "normal",
  qualificationRule: "Based on final regional placements.",
  formatSummary:
    "20-team Worlds format: Play-In, Group Stage, Knockout, and champion storage.",
  entrantsSummary:
    "LCK/LPL/LCS/LEC base 3, LCP/CBLOL base 2, MSI bonus 2, LCQ 2, total 20 teams.",
  stages: [
    {
      name: "Qualification Pool",
      format: "Participant pool is finalized from regional seeds, MSI bonus seeds, and LCQ placeholders.",
      entrants: 20,
      notes:
        "LCK/LPL/LCS/LEC 1-3 seeds go direct to groups; LCP/CBLOL, bonus seeds, and LCQ begin in Play-In.",
    },
    {
      name: "Group Stage",
      format: "Four groups of four teams.",
      entrants: 16,
      advancing: 8,
      notes: "Top two teams from each group advance to Knockout.",
    },
    {
      name: "Knockout Stage",
      format: "Eight-team World Cup-style knockout bracket.",
      entrants: 8,
      advancing: 1,
      notes: "Quarterfinals, semifinals, and final are BO5; the final winner is stored as Worlds champion.",
    },
  ],
  status: "locked",
};

const worldsAsianGames: Competition = {
  ...worldsNormal,
  order: 7,
  calendarType: "asian-games",
};

export const normalSeasonCompetitions: Competition[] = [
  lckCup,
  firstStand,
  lckRounds12,
  msi,
  lckRounds35,
  worldsNormal,
];

export const asianGamesSeasonCompetitions: Competition[] = [
  lckCup,
  firstStand,
  lckRounds12,
  msi,
  lckRounds34,
  asianGames,
  worldsAsianGames,
];

export const seasonTemplates: SeasonTemplate[] = [
  {
    id: "lck-2025-reference",
    name: "Normal LoL Esports Season",
    referenceSeason: 2025,
    type: "normal",
    description:
      "LCK Cup -> First Stand -> LCK Rounds 1-2 -> MSI -> LCK Rounds 3-5 -> Worlds.",
    competitions: normalSeasonCompetitions,
  },
  {
    id: "lck-2026-asian-games-reference",
    name: "Asian Games LoL Esports Season",
    referenceSeason: 2026,
    type: "asian-games",
    description:
      "LCK Cup -> First Stand -> LCK Rounds 1-2 -> MSI -> LCK Rounds 3-4 -> Asian Games -> Worlds.",
    competitions: asianGamesSeasonCompetitions,
  },
];

export function getCompetitionTemplate(competitionId: Competition["id"]) {
  return (
    [...normalSeasonCompetitions, ...asianGamesSeasonCompetitions].find(
      (competition) => competition.id === competitionId,
    ) ?? null
  );
}
