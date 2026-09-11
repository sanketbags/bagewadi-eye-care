import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "owner") {
    return NextResponse.json({ error: "Owners only." }, { status: 403 });
  }

  const { staff_id, monthly_amount, bonus, effective_from, notes } = await request.json();

  if (!staff_id || monthly_amount == null) {
    return NextResponse.json(
      { error: "Staff member and monthly amount are required." },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("salaries").insert({
    staff_id,
    monthly_amount,
    bonus: bonus || null,
    effective_from: effective_from || new Date().toISOString().slice(0, 10),
    notes: notes || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
