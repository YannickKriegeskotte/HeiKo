const snapshotRepo = require("../repositories/snapshot.repo");
const { calculateMonthlySnapshot, calculateYearlySnapshot } = require("../domain/snapshot.calculator");


/**
 * 
 * @json snapshot 
 */
async function processNewMonth(snapshot) {
  console.log("service processNewMonth");
  

  // ===========================
  // GET PREVIOUS MONTH FROM DB
  // ===========================

  const month = snapshot.yearMonth;

  const prevRaw = await snapshotRepo.getPreviousMonth(month);

  const prev = prevRaw.payload;

  // ===========================
  // CALCULATE MONTH STUFF
  // ===========================

  const processedMonth = await calculateMonthlySnapshot(snapshot, prev);
  
  // ===========================
  // SAVE NEW MONTH TO DB
  // ===========================

  await snapshotRepo.saveMonth(processedMonth);

  // ===========================
  // UPDATE YEARLY SNAPSHOT
  // ===========================

  await addMonthToYear(processedMonth);

}

/**
 * @json processedMonth
 * @string year 
 */
async function addMonthToYear(processedMonth){
  console.log("service addMonthToYear");

  // ===========================
  // EXTRACT YEAR FROM SNAPSHOT
  // ===========================

  let year = new Date(`${processedMonth.yearMonth}-01`);
  year = `${year.getFullYear()}`;


  // ===========================
  // GET YEAR FROM DB
  // ===========================

  const snapshotRaw = await getYear(year);
  const snapshot = snapshotRaw.data

  // ===========================
  // CALCULATE YEAR STUFF
  // ===========================

  let processedYear = await calculateYearlySnapshot(snapshot,processedMonth, year);

  // ===========================
  // SAVE UPDATED YEAR IN DB
  // ===========================

  await snapshotRepo.saveYear(processedYear);
}




// ===========================
// MONTH
// ===========================

async function saveMonth(snapshot) {
  console.log("service saveMonth");
  await snapshotRepo.saveMonth(snapshot);

  return {
    success: true,
  };
}

async function getMonth(month) {
  console.log("service getMonth");
  const data = await snapshotRepo.getMonth(month);

  return {
    success: data !== null,
    data,
  };
}

async function getLatestMonth() {
  console.log("service getLatestMonth");
  const data = await snapshotRepo.getLatestMonth();

  return {
    success: data !== null,
    data,
  };
}

async function getPreviousMonth(month) {
  console.log("service getPreviousMonth");
  const data = await snapshotRepo.getPreviousMonth(month);

  return {
    success: data !== null,
    data,
  };
}

// ===========================
// YEAR
// ===========================

async function saveYear(snapshot) {
  console.log("service saveYear");
  await snapshotRepo.saveYear(snapshot);

  return {
    success: true,
  };
}

async function getYear(year) {
  console.log("service getYear");
  const data = await snapshotRepo.getYear(year);

  return {
    success: data !== null,
    data,
  };
}

async function getLatestYear() {
  console.log("service getLatestYear");
  const data = await snapshotRepo.getLatestYear();

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