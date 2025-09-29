// app/api/wolf/status/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabaseServer";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

    const { data: room } = await supabaseServer.from("wolf_rooms").select("*").eq("code", code).single();
    if (!room) return NextResponse.json({ error: "room not found" }, { status: 404 });

    const { data: players } = await supabaseServer
      .from("wolf_players")
      .select("*")
      .eq("room_id", room.id)
      .order("joined_at", { ascending: true });

    const now = new Date();
    const phase_end_at = room.phase_end_at ? new Date(room.phase_end_at) : null;
    const timeLeft = phase_end_at ? Math.max(0, Math.floor((phase_end_at.getTime() - now.getTime()) / 1000)) : null;

    return NextResponse.json({ room, players, timeLeft });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
