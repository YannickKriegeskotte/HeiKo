   async function runCalculations(db, date) {

    // =========================
    // STROM BEISPIEL
    // =========================

    const rows = await db.all(`
    SELECT *
    FROM time_series
    WHERE type = 'strom'
      AND metric = 'zaehler'
      AND date = ?
  `, [date]);

    for (const row of rows) {

      const previous = await db.get(`
      SELECT value
      FROM time_series
      WHERE type = 'strom'
        AND metric = 'zaehler'
        AND apartment_id = ?
        AND date < ?
      ORDER BY date DESC
      LIMIT 1
    `, [row.apartment_id, date]);

      const last = previous?.value ?? 0;
      const consumption = (row.value ?? 0) - last;

      await db.run(`
      INSERT INTO time_series (type, apartment_id, metric, value, date)
      VALUES ('strom', ?, 'verbrauch', ?, ?)
    `, [row.apartment_id, consumption, date]);
    }

    // =========================
    // HIER KANNST DU WEITERE LOGIKEN EINBAUEN:
    // - wasser
    // - öl
    // - kosten
    // =========================
  }