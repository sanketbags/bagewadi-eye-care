import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (me?.role !== "owner") return NextResponse.json({ error: "Owners only." }, { status: 403 });

  const { enabled } = await request.json();
  const { error } = await supabase
    .from("settings")
    .update({ value: enabled ? "true" : "false" })
    .eq("key", "booking_enabled");

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
