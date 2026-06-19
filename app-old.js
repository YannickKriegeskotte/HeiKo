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

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // =========================
  // SCHEMA
  // =========================
  await db.exec(`
    CREATE TABLE IF NOT EXISTS time_series (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      apartment_id TEXT,
      metric TEXT NOT NULL,
      value REAL,
      state INTEGER,
      date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS monthly_snapshot (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      apartment_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      UNIQUE(date, apartment_id)
    );

    CREATE TABLE IF NOT EXISTS yearly_snapshot (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      apartment_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      UNIQUE(year, apartment_id)
    );
  `);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, "public")));

  app.get("/ping", (req, res) => res.sendStatus(200));

  // =====================================================
  // TIME SERIES
  // =====================================================

  app.post("/time/save", async (req, res) => {
    const { id, type, apartment_id, metric, value, state, date } = req.body;

    try {
      if (id) {
        await db.run(
          `UPDATE time_series
           SET type=?, apartment_id=?, metric=?, value=?, state=?, date=?
           WHERE id=?`,
          [type, apartment_id, metric, value, state, date, id]
        );
      } else {
        await db.run(
          `INSERT INTO time_series (type, apartment_id, metric, value, state, date)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [type, apartment_id, metric, value, state, date]
        );
      }

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "DB-Fehler" });
    }
  });

  app.get("/time/latest", async (req, res) => {
    const { type, apartment_id, metric } = req.query;

    const row = await db.get(
      `SELECT *
       FROM time_series
       WHERE type=? AND metric=?
       AND (apartment_id=? OR apartment_id IS NULL)
       ORDER BY date DESC
       LIMIT 1`,
      [type, metric, apartment_id]
    );

    res.json(row || null);
  });

  app.get("/time/range", async (req, res) => {
    const { type, apartment_id, metric, from, to } = req.query;

    const rows = await db.all(
      `SELECT *
       FROM time_series
       WHERE type=? AND metric=? AND apartment_id=?
       AND date BETWEEN ? AND ?
       ORDER BY date ASC`,
      [type, metric, apartment_id, from, to]
    );

    res.json(rows);
  });

  app.get("/time/all", async (req, res) => {
    const rows = await db.all(`SELECT * FROM time_series ORDER BY date ASC`);
    res.json(rows);
  });

  app.get("/time/valueAtDate", async (req, res) => {
    const { type, metric, apartment_id, date } = req.query;

    const row = await db.get(
      `SELECT *
       FROM time_series
       WHERE type=? AND metric=? AND apartment_id=? AND date<=?
       ORDER BY date DESC
       LIMIT 1`,
      [type, metric, apartment_id, date]
    );

    res.json(row || null);
  });

  app.get("/time/previous", async (req, res) => {
    const { type, metric, apartment_id, date } = req.query;

    const row = await db.get(
      `SELECT *
       FROM time_series
       WHERE type=? AND metric=? AND apartment_id=? AND date<?
       ORDER BY date DESC
       LIMIT 1`,
      [type, metric, apartment_id, date]
    );

    res.json(row || null);
  });























  // =====================================================
  // SNAPSHOT BASE ROUTER (monthly + yearly unified)
  // =====================================================

  function snapshotTable(type) {
    return type === "yearly" ? "yearly_snapshot" : "monthly_snapshot";
  }

  function snapshotKey(type) {
    return type === "yearly" ? "year" : "date";
  }













  // =========================
  // START
  // =========================
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
    exec(`start http://localhost:${PORT}/index/index.html`);
  });
}

main().catch(err => {
  console.error(err);
  process.stdin.resume();
});