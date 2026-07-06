const snapshotService = require("../services/snapshot.service");

// ===========================
// MONTH
// ===========================

async function saveMonth(req, res) {
  console.log("controller saveMonth");
  const result = await snapshotService.saveMonth(req.body);
  res.json(result);
}

async function getMonth(req, res) {
  console.log("controller getMonth");
  const result = await snapshotService.getMonth(req.body);
  res.json(result);
}

async function getLatestMonth(req, res) {
  console.log("controller getLatestMonth");
  const result = await snapshotService.getLatestMonth();
  res.json(result);
}

async function getPreviousMonth(req, res) {
  console.log("controller getPreviousMonth");
  const result = await snapshotService.getPreviousMonth(req.body);
  res.json(result);
}

async function processNewMonth(req, res) {
  console.log("controller processNewMonth");
  try {
    const snapshot = req.body;
    const result = await snapshotService.processNewMonth(snapshot);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ===========================
// YEAR
// ===========================

async function saveYear(req, res) {
  console.log("controller saveYear");
  const result = await snapshotService.saveYear(req.body);
  res.json(result);
}

async function getYear(req, res) {
  console.log("controller getYear");

  const year = req.params.year;

  const result = await snapshotService.getYear(year);
  res.json(result);
}

async function getLatestYear(req, res) {
  console.log("controller getLatestYear");
  const result = await snapshotService.getLatestYear();
  res.json(result);
}

module.exports = {
  saveMonth,
  getMonth,
  getLatestMonth,
  getPreviousMonth,
  processNewMonth,

  saveYear,
  getYear,
  getLatestYear,
};