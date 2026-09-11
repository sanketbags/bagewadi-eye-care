import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (me?.role !== "owner") return NextResponse.json({ error: "Owners only." }, { status: 403 });

  const { id, active } = await request.json();
  if (!id || typeof active !== "boolean") return NextResponse.json({ error: "Missing data." }, { status: 400 });

  // Prevent an owner from deactivating themselves (locks them out).
  if (id === user.id && active === false) {
    return NextResponse.json({ error: "You can't deactivate your own account." }, { status: 400 });
  }

  const { error } = await supabase.from("profiles").update({ active }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
