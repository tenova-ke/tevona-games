// /routes/chat.routes.js
import express from "express";
import { sendMessage, getMessages } from "../services/chat.service.js";

const router = express.Router();

// Send a chat message
router.post("/send", async (req, res) => {
  try {
    const { gameId, userId, message } = req.body;
    const result = await sendMessage(gameId, userId, message);
    res.json(result);
  } catch (err) {
    console.error("Chat send error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Get chat messages for a game
router.get("/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;
    const messages = await getMessages(gameId);
    res.json(messages);
  } catch (err) {
    console.error("Chat fetch error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;
