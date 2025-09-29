// app/api/wolf/start/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabaseServer";
import { fillWithBots, assignRoles } from "../../../../lib/gameEngine";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

    const { data: room } = await supabaseServer.from("wolf_rooms").select("*").eq("code", code).single();
    if (!room) return NextResponse.json({ error: "room not found" }, { status: 404 });

    const { data: players } = await supabaseServer.from("wolf_players").select("*").eq("room_id", room.id);
    const currentCount = players ? players.length : 0;
    const target = room.max_players ?? 8;

    // fill with AI up to min or max - choose min players requirement
    await fillWithBots(supabaseServer, room.id, currentCount, target);

    // assign roles
    await assignRoles(supabaseServer, room.id);

    // set phase to 'night' and phase_end_at
    const now = new Date();
    const phaseDurationSec = 90;
    const phaseEnd = new Date(now.getTime() + phaseDurationSec * 1000).toISOString();

    const { error } = await supabaseServer
      .from("wolf_rooms")
      .update({ status: "in_progress", phase: "night", phase_end_at: phaseEnd })
      .eq("id", room.id);

    if (error) throw error;

    return NextResponse.json({ ok: true, phase: "night", phase_end_at: phaseEnd });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
