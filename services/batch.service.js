   /*
   app.post("/time/save-batch", async (req, res) => {
    const { date, entries } = req.body;

    try {
      // =========================
      // 1. ROHDATEN SPEICHERN
      // =========================
      const insertStmt = await db.prepare(`
      INSERT INTO time_series (type, apartment_id, metric, value, state, date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

      for (const e of entries) {
        await insertStmt.run(
          e.type,
          e.apartment_id || null,
          e.metric,
          e.value ?? null,
          e.state ?? null,
          date
        );
      }

      await insertStmt.finalize();

      // =========================
      // 2. BERECHNUNGEN AUSLÖSEN
      // =========================
      await runCalculations(db, date);

      // =========================
      // 3. SNAPSHOTS AKTUALISIEREN
      // =========================
      await updateMonthlySnapshot(db, date);
      await updateYearlySnapshot(db, date);

      res.json({ success: true });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "DB Fehler" });
    }
  });
  */