import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (!me) return NextResponse.json({ error: "Staff only." }, { status: 403 });

  const { id, status, confirmed_date_text, confirmed_time_text, clinic_note } = await request.json();
  if (!id || !["confirmed", "declined"].includes(status)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (status === "confirmed" && (!confirmed_date_text || !confirmed_time_text)) {
    return NextResponse.json({ error: "Please set a date and time to confirm." }, { status: 400 });
  }

  const update = { status, confirmed_by: user.id, clinic_note: clinic_note || null };
  if (status === "confirmed") {
    update.confirmed_date_text = confirmed_date_text;
    update.confirmed_time_text = confirmed_time_text;
  }

  const { error } = await supabase.from("appointments").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
