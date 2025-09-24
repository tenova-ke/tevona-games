// /routes/auth.routes.js
const express = require("express");
const router = express.Router();
const userService = require("../services/user.service");

/**
 * Create profile
 * POST /auth/register
 */
router.post("/register", async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({ error: "username and email are required" });
    }

    const profile = await userService.createProfile({ username, email });
    res.status(201).json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get profile by ID
 * GET /auth/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await userService.getProfileById(id);

    if (!profile) return res.status(404).json({ error: "User not found" });

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Update profile
 * PUT /auth/:id
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const profile = await userService.updateProfile(id, updates);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * List all profiles
 * GET /auth
 */
router.get("/", async (req, res) => {
  try {
    const profiles = await userService.listProfiles();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
