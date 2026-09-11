import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (me?.role !== "owner") return NextResponse.json({ error: "Owners only." }, { status: 403 });

  const { id, full_name, job_title, role } = await request.json();
  if (!id || !full_name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (role && !["staff", "owner"].includes(role)) return NextResponse.json({ error: "Invalid role." }, { status: 400 });

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, job_title: job_title || null, role: role || "staff" })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
