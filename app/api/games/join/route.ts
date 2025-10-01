// app/api/games/join/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  const supabase = createClient();
  const { game_id, profile_id, player_tag, role } = await req.json();

  const { data, error } = await supabase
    .from("game_players")
    .insert([{ game_id, profile_id, player_tag, role }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ player: data });
}
