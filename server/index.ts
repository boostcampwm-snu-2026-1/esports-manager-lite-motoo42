import { createApp } from "./app.js";
import {
  getClientDistPath,
  getCorsOrigins,
  getServerHost,
  getServerPort,
  shouldServeClient,
} from "./config.js";
import { closeMongoConnection } from "./db/mongo.js";

const host = getServerHost();
const port = getServerPort();
const app = createApp({
  clientDistPath: getClientDistPath(),
  corsOrigins: getCorsOrigins(),
  serveClient: shouldServeClient(),
});

const server = app.listen(port, host, () => {
  console.log(`Web server listening on http://${host}:${port}`);
});

async function shutdown() {
  server.close();
  await closeMongoConnection();
}

process.on("SIGINT", () => {
  void shutdown().then(() => process.exit(0));
});

process.on("SIGTERM", () => {
  void shutdown().then(() => process.exit(0));
});
