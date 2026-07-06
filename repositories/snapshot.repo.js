const { getDB } = require("../db/dbStore");

// ===========================
// MONTH
// ===========================

/**
 *
 * @param {*} snapshot
 */
async function saveMonth(snapshot) {
  console.log("repo saveMonth");
  const db = getDB();

  await db.run(
    `
    INSERT INTO monthly_snapshot
    (date, payload)
    VALUES (?, ?)
    `,
    [snapshot.yearMonth, JSON.stringify(snapshot)],
  );
}

/**
 *
 * @param {*} month
 * @returns Month JSON / NULL
 */
async function getMonth(month) {
  console.log("repo getMonth");
  const db = getDB();

  const row = await db.get(
    `
    SELECT *
    FROM monthly_snapshot
    WHERE date = ?
    `,
    [month],
  );

  if (!row) return null;

  return {
    ...row,
    payload: JSON.parse(row.payload),
  };
}

/**
 *
 * @returns Month JSON / NULL
 */
async function getLatestMonth() {
  console.log("repo getLatestMonth");
  const db = getDB();

  const row = await db.get(`
    SELECT *
    FROM monthly_snapshot
    ORDER BY date DESC
    LIMIT 1
  `);

  if (!row) return null;
  return {
    ...row,
    payload: JSON.parse(row.payload),
  };
}

/**
 *
 * @string month
 * @returns Month JSON / NULL
 */
async function getPreviousMonth(month) {
  console.log("repo getPreviousMonth");
  const date = new Date(`${month}-01`);

  date.setMonth(date.getMonth() - 1);

  const previousMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

  return await getMonth(previousMonth);
}

// ===========================
// YEAR
// ===========================

/**
 *
 * @param {*} snapshot
 */
async function saveYear(snapshot) {
  console.log("repo saveYear");
  const db = getDB();

  await db.run(
    `
    INSERT INTO yearly_snapshot
    (year, payload)
    VALUES (?, ?)
    `,
    [snapshot.year, JSON.stringify(snapshot)],
  );
}

/**
 *
 * @param {*} year
 * @returns Year JSON / NULL
 */
async function getYear(year) {
  console.log("repo getYear");
  const db = getDB();

  const row = await db.get(
    `
    SELECT *
    FROM yearly_snapshot
    WHERE year = ?
    `,
    [year],
  );

  if (!row) return null;

  return {
    ...row,
    payload: JSON.parse(row.payload),
  };
}

/**
 *
 * @returns Year JSON / NULL
 */
async function getLatestYear() {
  console.log("repo getLatestYear");
  const db = getDB();

  const row = await db.get(`
    SELECT *
    FROM yearly_snapshot
    ORDER BY year DESC
    LIMIT 1
  `);

  if (!row) return null;
  return {
    ...row,
    payload: JSON.parse(row.payload),
  };
}
module.exports = {
  saveMonth,
  getMonth,
  getLatestMonth,
  getPreviousMonth,
  saveYear,
  getYear,
  getLatestYear,
};
