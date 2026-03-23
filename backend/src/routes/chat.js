const express  = require("express");
const router   = express.Router();
const { chatbot }    = require("../controllers/chatController");
const { verifyToken } = require("../middleware/auth");

// Usar verifyToken — no auth
router.post("/", verifyToken, chatbot);

module.exports = router;