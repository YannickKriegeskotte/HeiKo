const router = require("express").Router();
const snapshotController = require("../controllers/snapshot.controller");

router.post("/:type/save", snapshotController.save);
router.get("/:type/get", snapshotController.get);
router.get("/:type/all", snapshotController.all);
router.delete("/:type/delete", snapshotController.remove);

module.exports = router;