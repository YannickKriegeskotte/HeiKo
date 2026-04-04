const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const { exec } = require("child_process");
const path = require("path");

// Pfad zur exe oder zum Script
const dbPath = path.join(process.pkg ? path.dirname(process.execPath) : __dirname, "data.db");

async function main() {
  const app = express();

  // ----SQLite öffnen (oder erstellen) ----
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // ---- Tabelle anlegen (nur beim ersten Start) ----
  await db.exec(`
    CREATE TABLE IF NOT EXISTS data (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

// ---- Middleware ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ---- Server availability ----
app.get("/ping", (req, res) => res.sendStatus(200));

// ---- Get Value ----
app.get("/get", async (req, res) =>{
    const key = req.query.key;
    const row = await db.get("SELECT value FROM data WHERE key = ?", [key]);
    res.json({value: row ? row.value : null});
});

// ---- Get All Values ----
app.get("/getAll", async (req, res) =>{
    try{
      const rows = await db.all("SELECT key, value FROM data");
      res.json(rows);
    }
    catch(err){
      console.error(err);
      res.status(500).json({ error: "DB-Fehler" });
    }
});


// ---- Get all Values from keys containing a pattern ----
app.get("/getAllContaining", async (req, res) => {
    const pattern = req.query.pattern;
    const rows = await db.all("SELECT key, value FROM data WHERE key LIKE ?", [`%${pattern}%`]);
    res.json(rows || []);
});

// ---- Save Value ----
app.post("/save", async (req, res) =>{
    const {key, value} = req.body;
    await db.run("INSERT OR REPLACE INTO data (key,value) VALUES (?, ?)", [key,value]);
    res.json({success: true});
});

// ---- Update Value ----
app.post("/update", async (req, res) => {
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ error: "key fehlt" });

  try {
    await db.run("UPDATE data SET value = ? WHERE key = ?", [value, key]);
    res.json({success: true});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB-Fehler" });
  }
});

// ---- Rename Key ----
app.post("/rename", async (req, res) => {
  const { oldKey, newKey } = req.body;
  if (!oldKey || !newKey) return res.status(400).json({ error: "oldKey oder newKey fehlt" });

  try {
    // Prüfen, ob der neue Key schon existiert (weil PRIMARY KEY)
    const existing = await db.get("SELECT key FROM data WHERE key = ?", [newKey]);
    if (existing) {
      return res.status(400).json({ error: "newKey existiert bereits" });
    }

    // Key umbenennen
    const result = await db.run("UPDATE data SET key = ? WHERE key = ?", [newKey, oldKey]);

    if (result.changes === 0) {
      return res.status(404).json({ error: "oldKey nicht gefunden" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB-Fehler" });
  }
});


// ---- Delete all entries containing Value ----
app.delete("/removeApartmentEntries", async (req, res) =>{
    const id= req.query.apartmentID;
    await db.run("DELETE FROM data WHERE key LIKE ?", [`%${id}%`]);
    res.json({success: true});
});

// ---- Delete a single entry ----
app.delete("/delete",async(req,res) =>{
  const { key } = req.body;
  await db.run("DELETE FROM data WHERE key = ?",[key]);
  res.json({ success: true});
});



// ---- Server starten und Browser öffnen ----
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
    exec(`start http://localhost:${PORT}/index/index.html`);
});
}

// Fehlerbehandlung: Fenster bleibt offen bei Problemen
main().catch(err => {
  console.error(err);
  console.log("\nFehler beim Starten. Drücke eine Taste zum Beenden.");
  process.stdin.resume();
});