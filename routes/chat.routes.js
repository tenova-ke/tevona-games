// /routes/chat.routes.js
const express = require("express");
const router = express.Router();
const chatService = require("../services/chat.service");

/**
 * Send message
 * POST /chat/send
 */
router.post("/send", async (req, res) => {
  try {
    const { gameId, userId, message } = req.body;

    if (!gameId || !userId || !message) {
      return res.status(400).json({ error: "gameId, userId, message required" });
    }

    const msg = await chatService.sendMessage({ gameId, userId, message });
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get game chat
 * GET /chat/:gameId
 */
router.get("/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;

    const messages = await chatService.getMessages(gameId);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
