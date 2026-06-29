const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const c = require("../controllers/studentRankHistoryController");

router.post("/snapshot", auth, c.snapshotAll);
router.get("/:studentId", auth, c.getByStudent);

module.exports = router;
