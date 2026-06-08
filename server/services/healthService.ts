import { pingDatabase } from "../db/mongo.js";
import { ensureCareerSaveIndexes } from "../repositories/careerSavesRepository.js";

export async function getHealthStatus() {
  const result = await pingDatabase();

  await ensureCareerSaveIndexes();

  return {
    database: result.databaseName,
    ok: true,
    service: "moba-esports-manager-lite-api",
  };
}
