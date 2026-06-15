export const dataDragonVersion = "16.12.1";

const dataDragonCdnBaseUrl = `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}`;

export function getChampionIconUrl(dataDragonId: string) {
  return `${dataDragonCdnBaseUrl}/img/champion/${dataDragonId}.png`;
}

export function getItemIconUrl(itemId: string) {
  return `${dataDragonCdnBaseUrl}/img/item/${itemId}.png`;
}
