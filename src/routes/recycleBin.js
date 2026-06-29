const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const c = require("../controllers/recycleBinController");

router.get("/", auth, c.getDeletedItems);
router.post("/restore", auth, c.restoreItem);
router.post("/delete", auth, c.permanentlyDeleteItem);

module.exports = router;
