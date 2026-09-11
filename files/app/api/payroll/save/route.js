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

  const { pay_month, rows } = await request.json();

  if (!pay_month || !Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json(
      { error: "A month and at least one staff row are required." },
      { status: 400 }
    );
  }

  // Only save rows where a base amount was entered.
  const records = rows
    .filter((r) => r.monthly_amount !== "" && r.monthly_amount != null)
    .map((r) => ({
      staff_id: r.staff_id,
      pay_month, // first of the month, e.g. 2026-09-01
      monthly_amount: Number(r.monthly_amount),
      bonus: r.bonus ? Number(r.bonus) : null,
      days_worked: r.days_worked ? Number(r.days_worked) : null,
      leave_taken: r.leave_taken ? Number(r.leave_taken) : null,
      notes: r.notes || null,
      effective_from: pay_month,
    }));

  if (records.length === 0) {
    return NextResponse.json({ error: "No amounts entered." }, { status: 400 });
  }

  const { error } = await supabase.from("salaries").insert(records);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, saved: records.length });
}
