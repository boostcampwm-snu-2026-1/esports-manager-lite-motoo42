import type {
  ContractType,
  Player,
  PlayerContract,
} from "../../types/game";

export type ContractTypeSelections = Record<string, ContractType>;

const contractTypeSalaryMultiplier: Record<ContractType, number> = {
  "one-year": 1,
  "two-year": 1.08,
  "one-plus-one": 1.04,
};

const contractTypeScoreBonus: Record<ContractType, number> = {
  "one-year": 0,
  "two-year": 6,
  "one-plus-one": 3,
};

export function getContractYears(type: ContractType): Pick<
  PlayerContract,
  "guaranteedYears" | "optionYear" | "remainingYears"
> {
  if (type === "two-year") {
    return {
      guaranteedYears: 2,
      remainingYears: 2,
    };
  }

  if (type === "one-plus-one") {
    return {
      guaranteedYears: 1,
      optionYear: true,
      remainingYears: 2,
    };
  }

  return {
    guaranteedYears: 1,
    remainingYears: 1,
  };
}

export function createPlayerContract({
  contractType,
  playerId,
  salaryOffer,
}: {
  playerId: string;
  contractType: ContractType;
  salaryOffer: number;
}): PlayerContract {
  return {
    playerId,
    salary: Math.max(0, Math.round(salaryOffer)),
    type: contractType,
    ...getContractYears(contractType),
  };
}

export function createPlayerContractsForRoster({
  playerIds,
  players,
  contractTypes,
}: {
  playerIds: string[];
  players: Player[];
  contractTypes: ContractTypeSelections;
}): PlayerContract[] {
  return playerIds.map((playerId) => {
    const player = players.find((candidate) => candidate.id === playerId);
    const contractType = contractTypes[playerId] ?? "one-year";

    return createPlayerContract({
      playerId,
      contractType,
      salaryOffer: player?.salaryExpectation ?? 0,
    });
  });
}

export function getPlayerContractDemand(
  player: Player,
  contractType: ContractType,
) {
  return Math.round(
    player.salaryExpectation * contractTypeSalaryMultiplier[contractType],
  );
}

export function getContractTypeScoreBonus(contractType: ContractType) {
  return contractTypeScoreBonus[contractType];
}
