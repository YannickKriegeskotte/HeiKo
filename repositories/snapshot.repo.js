const { getDB } = require("../db/dbStore");

// ===========================
// MONTH
// ===========================

/**
 *
 * @json snapshot
 */
async function saveMonth(snapshot) {
  console.log("\t\t repo saveMonth");
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
 * @string yearMonth
 * @returns Month JSON / NULL
 */
async function getMonth(yearMonth) {
  console.log("\t\t repo getMonth",yearMonth);
  const db = getDB();

  const row = await db.get(
    `
    SELECT *
    FROM monthly_snapshot
    WHERE date = ?
    `,
    [yearMonth],
  );

  if (!row){
    console.log("\t\t\t",row,"->",null);
    return null;
  } 

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
  console.log("\t\t repo getLatestMonth");
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
 * @string yearMonth
 * @returns Month JSON / NULL
 */
async function getPreviousMonth(yearMonth) {
  console.log("\t\t repo getPreviousMonth", yearMonth);
  const date = new Date(`${yearMonth}-01`);

  date.setMonth(date.getMonth() - 1);

  const previousYearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

  return await getMonth(previousYearMonth);
}

// ===========================
// YEAR
// ===========================

/**
 *
 * @json snapshot
 */
async function saveYear(snapshot) {
  console.log("\t\t repo saveYear");
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
 * @string year
 * @returns Year JSON / NULL
 */
async function getYear(year) {
  console.log("\t\t repo getYear");
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
  console.log("\t\t repo getLatestYear");
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
