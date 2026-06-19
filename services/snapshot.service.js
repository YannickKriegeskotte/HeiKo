function getDB() {
  // später sauber injizieren, erstmal simpel:
  return require("../server").db;
}

async function save(){

}



/*
  // SAVE
  app.post("/snapshot/:type/save", async (req, res) => {
    const { type } = req.params;
    const { date, year, apartment_id, payload } = req.body;

    const table = snapshotTable(type);

    const key = type === "yearly" ? year : date;

    try {
      await db.run(
        type === "yearly"
          ? `
            INSERT INTO yearly_snapshot (year, apartment_id, payload)
            VALUES (?, ?, ?)
            ON CONFLICT(year, apartment_id)
            DO UPDATE SET payload = excluded.payload
          `
          : `
            INSERT INTO monthly_snapshot (date, apartment_id, payload)
            VALUES (?, ?, ?)
            ON CONFLICT(date, apartment_id)
            DO UPDATE SET payload = excluded.payload
          `,
        [key, apartment_id, JSON.stringify(payload)]
      );

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "DB-Fehler" });
    }
  });

  // GET SINGLE
  app.get("/snapshot/:type/get", async (req, res) => {
    const { type } = req.params;
    const { date, year, apartment_id } = req.query;

    const table = snapshotTable(type);
    const key = type === "yearly" ? year : date;

    const row = await db.get(
      type === "yearly"
        ? `SELECT * FROM yearly_snapshot WHERE year=? AND apartment_id=?`
        : `SELECT * FROM monthly_snapshot WHERE date=? AND apartment_id=?`,
      [key, apartment_id]
    );

    if (!row) return res.json(null);

    res.json({ ...row, payload: JSON.parse(row.payload) });
  });

  // GET ALL
  app.get("/snapshot/:type/all", async (req, res) => {
    const { type } = req.params;
    const { apartment_id } = req.query;

    const table = snapshotTable(type);

    const rows = await db.all(
      `SELECT * FROM ${table} WHERE apartment_id=? ORDER BY ${snapshotKey(type)} ASC`,
      [apartment_id]
    );

    res.json(
      rows.map(r => ({
        ...r,
        payload: JSON.parse(r.payload),
      }))
    );
  });

  // DELETE
  app.delete("/snapshot/:type/delete", async (req, res) => {
    const { type } = req.params;
    const { date, year, apartment_id } = req.body;

    const key = type === "yearly" ? year : date;

    await db.run(
      type === "yearly"
        ? `DELETE FROM yearly_snapshot WHERE year=? AND apartment_id=?`
        : `DELETE FROM monthly_snapshot WHERE date=? AND apartment_id=?`,
      [key, apartment_id]
    );

    res.json({ success: true });
  });

  async function updateMonthlySnapshot(db, date) {

    const month = date.slice(0, 7); // YYYY-MM

    const data = await db.all(`
    SELECT *
    FROM time_series
    WHERE substr(date,1,7) = ?
  `, [month]);

    await db.run(`
    INSERT INTO monthly_snapshot (date, apartment_id, payload)
    VALUES (?, ?, ?)
    ON CONFLICT(date, apartment_id)
    DO UPDATE SET payload = excluded.payload
  `, [month, "all", JSON.stringify(data)]);
  }
  async function updateYearlySnapshot(db, date) {

    const year = date.slice(0, 4);

    const data = await db.all(`
    SELECT *
    FROM time_series
    WHERE substr(date,1,4) = ?
  `, [year]);

    await db.run(`
    INSERT INTO yearly_snapshot (year, apartment_id, payload)
    VALUES (?, ?, ?)
    ON CONFLICT(year, apartment_id)
    DO UPDATE SET payload = excluded.payload
  `, [year, "all", JSON.stringify(data)]);
  }


module.exports = {
  save,
  latest,
  all,
  previous
}; 

*/