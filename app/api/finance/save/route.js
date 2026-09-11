import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (me?.role !== "owner") return NextResponse.json({ error: "Owners only." }, { status: 403 });

  const { kind, category, amount, txn_date, note } = await request.json();
  if (!kind || !["income", "expense"].includes(kind)) return NextResponse.json({ error: "Pick income or expense." }, { status: 400 });
  if (!category) return NextResponse.json({ error: "Category is required." }, { status: 400 });
  if (amount == null || Number(amount) <= 0) return NextResponse.json({ error: "Enter a valid amount." }, { status: 400 });
  if (!txn_date) return NextResponse.json({ error: "Date is required." }, { status: 400 });

  const { error } = await supabase.from("transactions").insert({
    kind, category, amount: Number(amount), txn_date, note: note || null, created_by: user.id,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
