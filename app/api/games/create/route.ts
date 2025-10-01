// app/api/games/create/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  const supabase = createClient();
  const { game_type, wager, created_by } = await req.json();

  const { data, error } = await supabase
    .from("games")
    .insert([
      {
        game_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        game_type,
        wager,
        created_by,
      },
    ])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ game: data });
}
