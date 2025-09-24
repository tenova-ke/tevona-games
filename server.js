// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const gameRoutes = require("./routes/game.routes");
const chatRoutes = require("./routes/chat.routes");
const voteRoutes = require("./routes/vote.routes");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/game", gameRoutes);
app.use("/chat", chatRoutes);
app.use("/vote", voteRoutes);

// --- SOCKET.IO ---
const io = new Server(server, {
  cors: {
    origin: "*", // TODO: lock down later for production
    methods: ["GET", "POST"],
  },
});

// Handle socket connections
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join game room
  socket.on("join_game", ({ gameId, userId }) => {
    socket.join(gameId);
    io.to(gameId).emit("system", `${userId} joined game ${gameId}`);
  });

  // Chat message
  socket.on("chat_message", ({ gameId, userId, message }) => {
    io.to(gameId).emit("chat_message", { userId, message, ts: Date.now() });
  });

  // Vote cast
  socket.on("vote_cast", ({ gameId, voterId, targetId, round }) => {
    io.to(gameId).emit("vote_update", { voterId, targetId, round });
  });

  // Game state update (e.g., killed, round change)
  socket.on("game_update", ({ gameId, payload }) => {
    io.to(gameId).emit("game_update", payload);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
