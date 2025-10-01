// app/api/games/finish/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  const supabase = createClient();
  const { game_id, winner_id } = await req.json();

  const { data, error } = await supabase
    .from("games")
    .update({ status: "finished", winning_group: winner_id })
    .eq("id", game_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ game: data });
}
