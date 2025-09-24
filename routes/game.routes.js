// /routes/game.routes.js
const express = require("express");
const router = express.Router();
const gameService = require("../services/game.service");

/**
 * Create new game session
 * POST /game/create
 */
router.post("/create", async (req, res) => {
  try {
    const { gameType, groupId, createdBy } = req.body;

    if (!gameType || !createdBy) {
      return res.status(400).json({ error: "gameType and createdBy required" });
    }

    const game = await gameService.createGame({ gameType, groupId, createdBy });
    res.status(201).json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Join game
 * POST /game/join
 */
router.post("/join", async (req, res) => {
  try {
    const { gameId, userId } = req.body;

    if (!gameId || !userId) {
      return res.status(400).json({ error: "gameId and userId required" });
    }

    const participant = await gameService.joinGame({ gameId, userId });
    res.status(201).json(participant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Update game
 * PUT /game/:id
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await gameService.updateGame(id, updates);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * List games
 * GET /game
 */
router.get("/", async (req, res) => {
  try {
    const games = await gameService.listGames(req.query);
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
