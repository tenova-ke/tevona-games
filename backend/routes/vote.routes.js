// /routes/vote.routes.js
const express = require("express");
const router = express.Router();
const voteService = require("../services/vote.service");

/**
 * Cast vote
 * POST /vote/cast
 */
router.post("/cast", async (req, res) => {
  try {
    const { gameId, voterId, targetId, round } = req.body;

    if (!gameId || !voterId || !targetId || !round) {
      return res
        .status(400)
        .json({ error: "gameId, voterId, targetId, round required" });
    }

    const vote = await voteService.castVote({
      gameId,
      voterId,
      targetId,
      round,
    });
    res.status(201).json(vote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get votes for a round
 * GET /vote/:gameId/:round
 */
router.get("/:gameId/:round", async (req, res) => {
  try {
    const { gameId, round } = req.params;
    const votes = await voteService.getVotes(gameId, round);
    res.json(votes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Tally votes
 * GET /vote/tally/:gameId/:round
 */
router.get("/tally/:gameId/:round", async (req, res) => {
  try {
    const { gameId, round } = req.params;
    const result = await voteService.tallyVotes(gameId, round);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
