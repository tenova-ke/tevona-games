// server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { supabase } = require("./config/supabase");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/game", require("./routes/game"));
app.use("/api/chat", require("./routes/chat"));

// Sockets
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Handle chat messages
  socket.on("chat_message", async (msg) => {
    try {
      // Save to Supabase
      const { data, error } = await supabase
        .from("chats")
        .insert([
          {
            user_id: msg.user_id,
            message: msg.message,
            game_id: msg.game_id || null,
          },
        ])
        .select();

      if (error) {
        console.error("Supabase insert error:", error.message);
        return;
      }

      // Broadcast to all clients
      io.emit("chat_message", data[0]);
    } catch (err) {
      console.error("Chat socket error:", err.message);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Server listen
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
