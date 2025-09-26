// /services/vote.service.js
const supabase = require("../config/supabase");

/**
 * Cast a vote (user votes for another user in a game round)
 */
async function castVote({ gameId, voterId, targetId, round }) {
  const { data, error } = await supabase
    .from("votes")
    .insert([
      {
        game_id: gameId,
        voter_id: voterId,
        target_id: targetId,
        round,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Get all votes for a round
 */
async function getVotes(gameId, round) {
  const { data, error } = await supabase
    .from("votes")
    .select("id, voter_id, target_id, created_at")
    .eq("game_id", gameId)
    .eq("round", round);

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Tally votes (who got the most votes this round)
 */
async function tallyVotes(gameId, round) {
  const { data, error } = await supabase
    .from("votes")
    .select("target_id, count:target_id(count)")
    .eq("game_id", gameId)
    .eq("round", round)
    .group("target_id");

  if (error) throw new Error(error.message);

  if (!data || data.length === 0) return null;

  // Sort descending by vote count
  data.sort((a, b) => b.count - a.count);
  return data[0]; // top-voted player
}

module.exports = {
  castVote,
  getVotes,
  tallyVotes,
};
