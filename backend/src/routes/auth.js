const express = require("express");
const router  = express.Router();
const { login, register, me } = require("../controllers/authController");
const { verifyToken, requireAdmin } = require("../middleware/auth");

router.post("/login",    login);
router.post("/register", verifyToken, requireAdmin, register);
router.get("/me",        verifyToken, me);

module.exports = router;