async function initSchema(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS monthly_snapshot (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      payload TEXT NOT NULL,
      UNIQUE(date)
    );

    CREATE TABLE IF NOT EXISTS yearly_snapshot (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      payload TEXT NOT NULL,
      UNIQUE(year)
    );
  `);
}

module.exports = { initSchema };