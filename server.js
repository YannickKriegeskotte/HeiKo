const { initDB } = require("./db/database");
const { initSchema } = require("./db/schema");
const { createApp } = require("./app");
const dbStore = require("./db/dbStore");

async function main() {
  // =========================
  // DB SETUP
  // =========================
  const db = await initDB();
  dbStore.setDB(db);
  await initSchema(db);

  // =========================
  // APP ERZEUGEN
  // =========================
  const app = createApp(db);

  // =========================
  // START
  // =========================
  const PORT = 3000;

  app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.stdin.resume();
});