// app/api/games/status/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function GET(req: Request) {
  const supabase = createClient();
  const { searchParams } = new URL(req.url);
  const game_id = searchParams.get("game_id");

  const { data: game, error } = await supabase
    .from("games")
    .select("*, game_players(*, profiles(username, avatar_url)), chat_messages(*)")
    .eq("id", game_id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ game });
}
