const express = require("express");
const router = express.Router();

const timeController = require("../controllers/time.controller");
const batchController = require("../controllers/batch.controller");

router.post("/save", timeController.save);
router.get("/latest", timeController.latest);
router.get("/all", timeController.all);
router.get("/previous", timeController.previous);
router.post("/save-batch", batchController.saveBatch);

module.exports = router; 