const snapshotRepo = require("../repositories/snapshot.repo");
const { calculateMonthlySnapshot, calculateYearlySnapshot } = require("../domain/snapshot.calculator");


/**
 * 
 * @json snapshot 
 */
async function processNewMonth(snapshot) {
  console.log("\t service processNewMonth");

  if(snapshot === null){
    console.log("\t\t",snapshot,"->",null);
    return null;
  }


  // ===========================
  // Vormonat aus DB laden
  // ===========================

  const yearMonth = snapshot.yearMonth;
  const prevRaw = await snapshotRepo.getPreviousMonth(yearMonth);
  let prev = null;

  // Vormonat gefunden
  if (prevRaw !== null) {
    prev = prevRaw.payload;
  }


 
  // ===========================
  // Businesslogik berechnen
  // ===========================

  const processedMonth = await calculateMonthlySnapshot(snapshot, prev);

  // ===========================
  // Aktuallisierten Monat in DB speichern
  // ===========================

  await snapshotRepo.saveMonth(processedMonth);

  // ===========================
  // Monat zu Yearly_snapshot hinzufügen
  // ===========================

  await addMonthToYear(processedMonth);

}

/**
 * @json processedMonth
 * @string year 
 */
async function addMonthToYear(processedMonth) {
  console.log("\t service addMonthToYear");

  // ===========================
  // Jahr aus Snapshot extrahieren
  // ===========================

  let year = new Date(`${processedMonth.yearMonth}-01`);
  year = `${year.getFullYear()}`;


  // ===========================
  // Besagtes Jahr aus DB laden
  // ===========================

  const snapshotDBRaw = await getYear(year);
  let snapshotDB = null;

  if (snapshotDBRaw !== null) {
    snapshotDB = snapshotDBRaw.data
  }
  // ===========================
  // Jahresbusinesslogik berechnen
  // ===========================

  let processedYear = await calculateYearlySnapshot(snapshotDB, processedMonth, year);

  // ===========================
  // Aktuallisiertes Jahr in DB speichern
  // ===========================

  await snapshotRepo.saveYear(processedYear);
}




// ===========================
// MONTH
// ===========================

async function saveMonth(snapshot) {
  console.log("\t service saveMonth");
  await snapshotRepo.saveMonth(snapshot);

  return {
    success: true,
  };
}

async function getMonth(YearMonth) {
  console.log("\t service getMonth", YearMonth);
  const data = await snapshotRepo.getMonth(YearMonth);
  console.log("\t\t success:", data !== null);

  return {
    success: data !== null,
    data,
  };
}

async function getLatestMonth() {
  console.log("\t service getLatestMonth");
  const data = await snapshotRepo.getLatestMonth();
  console.log("\t\t success:", data !== null);

  return {
    success: data !== null,
    data,
  };
}

async function getPreviousMonth(yearMonth) {
  console.log("\t service getPreviousMonth", yearMonth);
  const data = await snapshotRepo.getPreviousMonth(yearMonth);
  console.log("\t\t success:", data !== null);

  return {
    success: data !== null,
    data,
  };
}

// ===========================
// YEAR
// ===========================

async function saveYear(snapshot) {
  console.log("\t service saveYear");
  await snapshotRepo.saveYear(snapshot);

  return {
    success: true,
  };
}

async function getYear(year) {
  console.log("\t service getYear", year);
  const data = await snapshotRepo.getYear(year);
  console.log("\t\t success:", data !== null);

  return {
    success: data !== null,
    data,
  };
}

async function getLatestYear() {
  console.log("\t service getLatestYear");
  const data = await snapshotRepo.getLatestYear();
  console.log("\t\t success:", data !== null);

  return {
    success: data !== null,
    data,
  };
}

module.exports = {
  processNewMonth,
  saveMonth,
  getMonth,
  getLatestMonth,
  getPreviousMonth,

  saveYear,
  getYear,
  getLatestYear,
};