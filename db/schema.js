async function initSchema(db) {
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
}

module.exports = { initSchema };