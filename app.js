const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const { exec } = require("child_process");
const path = require("path");

// =========================
// DB PATH
// =========================
const dbPath = path.join(
  process.pkg ? path.dirname(process.execPath) : __dirname,
  "data.db"
);

async function main() {
  const app = express();

  // =========================
  // DB OPEN
  // =========================
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // =========================
  // SCHEMA
  // =========================
  await db.exec(`
    CREATE TABLE IF NOT EXISTS apartments (
      id TEXT PRIMARY KEY,
      name TEXT
    );

    CREATE TABLE IF NOT EXISTS time_series (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      type TEXT NOT NULL,

      apartment_id TEXT,
      metric TEXT NOT NULL,

      value REAL,
      state INTEGER,

      date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value REAL
    );
  `);

  // =========================
  // MIDDLEWARE
  // =========================
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, "public")));

  // =========================
  // PING
  // =========================
  app.get("/ping", (req, res) => res.sendStatus(200));

  // =====================================================
  // TIME SERIES (READINGS + FEES + UI)
  // =====================================================

  // Save entry (ALL IN ONE)
  app.post("/time/save", async (req, res) => {
    const {
      type,
      apartment_id = null,
      metric,
      value = null,
      state = null,
      date,
    } = req.body;

    try {
      await db.run(
        `INSERT INTO time_series (type, apartment_id, metric, value, state, date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [type, apartment_id, metric, value, state, date]
      );

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "DB-Fehler" });
    }
  });

  // Get latest value
  app.get("/time/latest", async (req, res) => {
    const { type, apartment_id, metric } = req.query;

    try {
      const row = await db.get(
        `SELECT *
         FROM time_series
         WHERE type = ?
           AND metric = ?
           AND (apartment_id = ? OR apartment_id IS NULL)
         ORDER BY date DESC
         LIMIT 1`,
        [type, metric, apartment_id]
      );

      res.json(row || null);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "DB-Fehler" });
    }
  });

  // Get range
  app.get("/time/range", async (req, res) => {
    const { type, apartment_id, metric, from, to } = req.query;

    try {
      const rows = await db.all(
        `SELECT *
         FROM time_series
         WHERE type = ?
           AND metric = ?
           AND apartment_id = ?
           AND date BETWEEN ? AND ?
         ORDER BY date ASC`,
        [type, metric, apartment_id, from, to]
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "DB-Fehler" });
    }
  });

  app.delete("/time/delete", async (req, res) => {
    const { id } = req.body;

    try {
      await db.run(
        `DELETE FROM time_series WHERE id = ?`,
        [id]
      );

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "DB-Fehler" });
    }
  });

  app.delete("/time/deleteByMetric", async (req, res) => {
    const { type, apartment_id, metric } = req.body;

    try {
      await db.run(
        `DELETE FROM time_series
       WHERE type = ?
         AND metric = ?
         AND (apartment_id = ? OR apartment_id IS NULL)`,
        [type, metric, apartment_id]
      );

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "DB-Fehler" });
    }
  });

  app.delete("/time/deleteRange", async (req, res) => {
    const { type, apartment_id, metric, from, to } = req.body;

    try {
      await db.run(
        `DELETE FROM time_series
       WHERE type = ?
         AND metric = ?
         AND apartment_id = ?
         AND date BETWEEN ? AND ?`,
        [type, metric, apartment_id, from, to]
      );

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "DB-Fehler" });
    }
  });

  app.get("/time/latestByType", async (req, res) => {
  const { type } = req.query;

  try {
    const rows = await db.all(
      `
      SELECT t.*
      FROM time_series t
      INNER JOIN (
        SELECT
          type,
          metric,
          apartment_id,
          MAX(date) AS max_date
        FROM time_series
        WHERE type = ?
        GROUP BY type, metric, apartment_id
      ) latest
      ON t.type = latest.type
      AND t.metric = latest.metric
      AND (
           (t.apartment_id = latest.apartment_id)
        OR (t.apartment_id IS NULL AND latest.apartment_id IS NULL)
      )
      AND t.date = latest.max_date
      `,
      [type]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB-Fehler" });
  }
});


app.get("/time/latestByYear", async (req, res) => {
    const { type, apartment_id, metric, year } = req.query;

    const row = await db.get(
        `SELECT *
         FROM time_series
         WHERE type = ?
           AND metric = ?
           AND apartment_id = ?
           AND substr(date,1,4) = ?
         ORDER BY date DESC, id DESC
         LIMIT 1`,
        [type, metric, apartment_id, year]
    );

    res.json(row || null);
});

  // =====================================================
  // SETTINGS (prices etc.)
  // =====================================================

  app.post("/settings/save", async (req, res) => {
    const { key, value } = req.body;

    try {
      await db.run(
        `INSERT INTO settings (key, value)
         VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [key, value]
      );

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "DB-Fehler" });
    }
  });

  app.get("/settings/get", async (req, res) => {
    const { key } = req.query;

    try {
      const row = await db.get(
        `SELECT value FROM settings WHERE key = ?`,
        [key]
      );

      res.json({ value: row?.value ?? null });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "DB-Fehler" });
    }
  });

  app.delete("/settings/delete", async (req, res) => {
    const { key } = req.body;

    try {
      await db.run(
        `DELETE FROM settings WHERE key = ?`,
        [key]
      );

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "DB-Fehler" });
    }
  });

  // =========================
  // Apartments
  // =========================

  app.delete("/apartments/delete", async (req, res) => {
    const { id } = req.body;

    try {
      await db.run(
        `DELETE FROM apartments WHERE id = ?`,
        [id]
      );

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "DB-Fehler" });
    }
  });

  // =========================
  // START
  // =========================
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
    exec(`start http://localhost:${PORT}/index/index.html`);
  });
}

// =========================
// ERROR HANDLING
// =========================
main().catch((err) => {
  console.error(err);
  process.stdin.resume();
});