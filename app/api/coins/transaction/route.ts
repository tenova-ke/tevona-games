// app/api/coins/transaction/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  const supabase = createClient();
  const { profile_id, type, amount, target_profile_id } = await req.json();

  const { data, error } = await supabase
    .from("transactions")
    .insert([{ profile_id, type, amount, target_profile_id }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ transaction: data });
}
