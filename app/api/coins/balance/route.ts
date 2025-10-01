// app/api/coins/balance/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  const supabase = createClient();
  const { searchParams } = new URL(req.url);
  const profile_id = searchParams.get("profile_id");

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, coins")
    .eq("id", profile_id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ balance: data });
}
