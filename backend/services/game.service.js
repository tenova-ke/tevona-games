// /services/game.service.js
const supabase = require("../config/supabase");
const { v4: uuidv4 } = require("uuid");

/**
 * Create a new game session
 */
async function createGame({ gameType, groupId, createdBy }) {
  const gameId = uuidv4();

  const { data, error } = await supabase
    .from("games")
    .insert([
      {
        game_id: gameId,
        game_type: gameType,
        group_id: groupId || null,
        created_by: createdBy,
        status: "waiting",
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Join an existing game
 */
async function joinGame({ gameId, userId }) {
  const { data, error } = await supabase
    .from("game_participants")
    .insert([{ game_id: gameId, user_id: userId }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Update game status or properties
 */
async function updateGame(gameId, updates) {
  const { data, error } = await supabase
    .from("games")
    .update(updates)
    .eq("game_id", gameId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * List games (filter optional)
 */
async function listGames(filter = {}) {
  let query = supabase.from("games").select("*");

  if (filter.status) query = query.eq("status", filter.status);
  if (filter.gameType) query = query.eq("game_type", filter.gameType);

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data;
}

module.exports = {
  createGame,
  joinGame,
  updateGame,
  listGames,
};
