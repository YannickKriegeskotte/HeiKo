const router = require("express").Router();
const snapshotController = require("../controllers/snapshot.controller");


// ===========================
// MONTH
// ===========================
router.post("/month/save", snapshotController.saveMonth);

router.get("/month/latest", snapshotController.getLatestMonth);

router.get("/month/get", snapshotController.getMonth);

router.get("/month/previous", snapshotController.getPreviousMonth);

router.post("/processNewMonth", snapshotController.processNewMonth);

// ===========================
// YEAR
// ===========================

router.post("/year/save", snapshotController.saveYear);

router.get("/year/latest", snapshotController.getLatestYear);

router.get("/year/get/:year", snapshotController.getYear);

module.exports = router;