const { getDB } = require("../db/dbStore");

async function save(data) {
  const db = getDB();

  const { id, type, apartment_id, metric, value, state, date } = data;

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

  return { success: true };
}

async function latest(query) {
  const db = getDB();

  return db.get(
    `SELECT *
     FROM time_series
     WHERE type=? AND metric=?
     AND (apartment_id=? OR apartment_id IS NULL)
     ORDER BY date DESC
     LIMIT 1`,
    [query.type, query.metric, query.apartment_id]
  );
}

async function all() {
  const db = getDB();
  return db.all(`SELECT * FROM time_series ORDER BY date ASC`);
}

async function previous(query) {
  const db = getDB();

  return db.get(
    `SELECT *
     FROM time_series
     WHERE type=? AND metric=? AND apartment_id=? AND date<?
     ORDER BY date DESC
     LIMIT 1`,
    [query.type, query.metric, query.apartment_id, query.date]
  );
}

module.exports = {
  save,
  latest,
  all,
  previous
};