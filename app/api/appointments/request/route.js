import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request) {
  const supabase = await createClient();

  // Check booking is enabled
  const { data: setting } = await supabase
    .from("settings").select("value").eq("key", "booking_enabled").maybeSingle();
  if (setting?.value !== "true") {
    return NextResponse.json({ error: "Online booking is currently closed. Please call the clinic." }, { status: 403 });
  }

  const body = await request.json();
  const { patient_name, phone, email, preferred_date, preferred_time, reason } = body;

  if (!patient_name || !preferred_date) {
    return NextResponse.json({ error: "Name and a preferred date are required." }, { status: 400 });
  }
  if (!phone && !email) {
    return NextResponse.json({ error: "Please give a phone or email so we can reach you." }, { status: 400 });
  }

  const { error } = await supabase.from("appointments").insert({
    patient_name, phone: phone || null, email: email || null,
    preferred_date, preferred_time: preferred_time || null, reason: reason || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
