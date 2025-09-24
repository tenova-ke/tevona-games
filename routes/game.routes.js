// /routes/game.routes.js
import express from "express";
import {
  createGame,
  joinGame,
  getGame,
  endGame,
} from "../services/game.service.js";

const router = express.Router();

// Create a new game
router.post("/create", async (req, res) => {
  try {
    const { name, maxPlayers } = req.body;
    const game = await createGame(name, maxPlayers);
    res.json(game);
  } catch (err) {
    console.error("Create game error:", err);
    res.status(500).json({ error: "Failed to create game" });
  }
});

// Join an existing game
router.post("/join", async (req, res) => {
  try {
    const { gameId, userId } = req.body;
    const result = await joinGame(gameId, userId);
    res.json(result);
  } catch (err) {
    console.error("Join game error:", err);
    res.status(500).json({ error: "Failed to join game" });
  }
});

// Fetch game state
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const game = await getGame(id);
    res.json(game);
  } catch (err) {
    console.error("Get game error:", err);
    res.status(500).json({ error: "Failed to fetch game" });
  }
});

// End a game
router.post("/end", async (req, res) => {
  try {
    const { gameId } = req.body;
    const result = await endGame(gameId);
    res.json(result);
  } catch (err) {
    console.error("End game error:", err);
    res.status(500).json({ error: "Failed to end game" });
  }
});

export default router;
