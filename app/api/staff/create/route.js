import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

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

  const { email, password, full_name, role, job_title } = await request.json();

  if (!email || !password || !full_name) {
    return NextResponse.json(
      { error: "Name, email, and a temporary password are required." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role: role || "staff", job_title: job_title || null },
  });

  if (createErr) {
    return NextResponse.json({ error: createErr.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: created.user.id });
}
