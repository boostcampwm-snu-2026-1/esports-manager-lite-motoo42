import { closeMongoConnection } from "./db/mongo.js";
import { careerSaveCollectionName } from "./models/careerSave.js";
import { getHealthStatus } from "./services/healthService.js";

try {
  const health = await getHealthStatus();
  console.log(
    JSON.stringify(
      {
        collection: careerSaveCollectionName,
        database: health.database,
        ok: health.ok,
      },
      null,
      2,
    ),
  );
} finally {
  await closeMongoConnection();
}
