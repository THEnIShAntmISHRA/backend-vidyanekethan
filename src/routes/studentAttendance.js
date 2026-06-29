const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const c = require("../controllers/studentAttendanceController.js");

router.get("/:studentId", auth, c.getByStudent);
router.post("/:studentId", auth, c.createByStudent);

module.exports = router;
