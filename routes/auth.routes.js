// /routes/auth.routes.js
import express from "express";
import { login, getProfile } from "../services/user.service.js";

const router = express.Router();

// User login or signup (mock for now, later integrate Supabase Auth if needed)
router.post("/login", async (req, res) => {
  try {
    const { username } = req.body;
    const user = await login(username);
    res.json(user);
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// Fetch profile
router.get("/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await getProfile(id);
    res.json(profile);
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

export default router;
