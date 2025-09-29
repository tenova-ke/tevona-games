// app/api/wolf/join/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { code, user_id, name } = await req.json();
    if (!code || !name) return NextResponse.json({ error: "code and name required" }, { status: 400 });

    // find room
    const { data: room } = await supabaseServer.from("wolf_rooms").select("*").eq("code", code).single();
    if (!room) return NextResponse.json({ error: "room not found" }, { status: 404 });

    // count players
    const { data: players } = await supabaseServer.from("wolf_players").select("id").eq("room_id", room.id);
    const count = players ? players.length : 0;

    if (count >= (room.max_players ?? 8)) {
      return NextResponse.json({ error: "room full" }, { status: 409 });
    }

    // insert player
    const { data: inserted } = await supabaseServer
      .from("wolf_players")
      .insert({
        room_id: room.id,
        user_id: user_id || null,
        name,
        is_ai: false,
        joined_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    // return updated player list & room
    const { data: updatedPlayers } = await supabaseServer
      .from("wolf_players")
      .select("*")
      .eq("room_id", room.id)
      .order("joined_at", { ascending: true });

    return NextResponse.json({ room, players: updatedPlayers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
