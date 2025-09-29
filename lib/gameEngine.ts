// lib/gameEngine.ts
import { SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";

export type RoleSet = "werewolf" | "seer" | "guardian" | "warga" | "sorcerer" | "villager";

export function generateRoomCode(len = 6) {
  return crypto.randomBytes(Math.ceil(len / 2)).toString("hex").slice(0, len).toUpperCase();
}

export async function fillWithBots(
  supabase: SupabaseClient,
  roomId: string,
  currentCount: number,
  targetCount: number
) {
  const needed = Math.max(0, targetCount - currentCount);
  if (needed === 0) return;

  const bots = [];
  for (let i = 0; i < needed; i++) {
    const name = `AI_${Math.random().toString(36).slice(2, 7)}`;
    bots.push({
      room_id: roomId,
      user_id: null,
      name,
      is_ai: true,
    });
  }
  await supabase.from("wolf_players").insert(bots);
}

export async function assignRoles(
  supabase: SupabaseClient,
  roomId: string
) {
  // Load players
  const { data: players } = await supabase
    .from("wolf_players")
    .select("id")
    .eq("room_id", roomId)
    .order("joined_at", { ascending: true });

  if (!players) return;

  const total = players.length;
  // simple role distribution — tweak later
  let werewolfCount = 1;
  if (total >= 6) werewolfCount = 2;
  if (total >= 12) werewolfCount = 3;

  // build role array
  const roles: RoleSet[] = [];
  for (let i = 0; i < werewolfCount; i++) roles.push("werewolf");
  roles.push("seer");
  roles.push("guardian");
  while (roles.length < total) roles.push("warga");

  // shuffle
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  // assign
  const updates = players.map((p: any, idx: number) => ({
    id: p.id,
    role: roles[idx],
  }));

  // perform updates (bulk)
  const calls = updates.map((u) => supabase.from("wolf_players").update({ role: u.role }).eq("id", u.id));
  await Promise.all(calls);
}
