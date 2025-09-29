// app/api/wolf/create/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabaseServer";
import { generateRoomCode } from "../../../../lib/gameEngine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, max_players = 8, min_players = 4, thumbnail_url = null } = body;

    if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });

    const code = generateRoomCode(6);
    const startsInSec = 30;
    const startsAt = new Date(Date.now() + startsInSec * 1000).toISOString();

    const { data: room, error: roomErr } = await supabaseServer
      .from("wolf_rooms")
      .insert({
        host_id: user_id,
        code,
        status: "waiting",
        starts_at: startsAt,
        phase: "waiting",
        phase_end_at: startsAt,
        max_players,
        min_players,
        image_url: thumbnail_url,
      })
      .select("*")
      .single();

    if (roomErr) throw roomErr;

    // create player for host
    const p = await supabaseServer
      .from("wolf_players")
      .insert({
        room_id: room.id,
        user_id,
        name: "Host", // frontend should update name later from profile
        is_ai: false,
        joined_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    return NextResponse.json({ room, player: p.data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || err }, { status: 500 });
  }
}
