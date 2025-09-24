// /services/chat.service.js
const supabase = require("../config/supabase");

/**
 * Send a chat message
 */
async function sendMessage({ gameId, userId, message }) {
  const { data, error } = await supabase
    .from("chat")
    .insert([
      {
        game_id: gameId,
        user_id: userId,
        message,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Get chat history for a game
 */
async function getMessages(gameId) {
  const { data, error } = await supabase
    .from("chat")
    .select("id, game_id, user_id, message, created_at")
    .eq("game_id", gameId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

module.exports = {
  sendMessage,
  getMessages,
};
