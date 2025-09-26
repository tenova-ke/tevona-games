// /services/user.service.js
const { supabase } = require("../config/supabase");

/**
 * Create a new profile
 * @param {Object} user
 * @param {string} user.username
 * @param {string} user.email
 * @returns {Promise<Object>}
 */
async function createProfile(user) {
  const { data, error } = await supabase
    .from("profiles")
    .insert([user])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get profile by ID
 * @param {string} id - User ID (UUID)
 * @returns {Promise<Object|null>}
 */
async function getProfileById(id) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
  return data || null;
}

/**
 * Update profile (e.g. username)
 * @param {string} id
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
async function updateProfile(id, updates) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * List all profiles (useful for admin/debug)
 * @returns {Promise<Array>}
 */
async function listProfiles() {
  const { data, error } = await supabase.from("profiles").select("*");

  if (error) throw error;
  return data;
}

module.exports = {
  createProfile,
  getProfileById,
  updateProfile,
  listProfiles,
};
