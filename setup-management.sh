#!/bin/bash
# Run this from inside your bagewadi-eye-care project folder.
# It creates all the owner-management files in one go.

set -e
echo "Creating owner management files..."

mkdir -p lib app/staff/manage app/api/staff/create app/api/salary/set

# --- lib/supabase-admin.js ---
cat > lib/supabase-admin.js << 'EOF'
import { createClient } from "@supabase/supabase-js";

// SERVER-ONLY. Uses the service_role key, which bypasses RLS.
// Never import this into a client component. It only runs in API routes.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
EOF

# --- app/api/staff/create/route.js ---
cat > app/api/staff/create/route.js << 'EOF'
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
EOF

# --- app/api/salary/set/route.js ---
cat > app/api/salary/set/route.js << 'EOF'
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
EOF

# --- app/staff/manage/page.js ---
cat > app/staff/manage/page.js << 'EOF'
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import ManageClient from "./ManageClient";

export default async function ManagePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/staff");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "owner") redirect("/staff/dashboard");

  const { data: staffList } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name");

  return <ManageClient profile={profile} staffList={staffList || []} />;
}
EOF

echo "...page files done, writing ManageClient..."

# --- app/staff/manage/ManageClient.js ---
cat > app/staff/manage/ManageClient.js << 'EOF'
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ManageClient({ profile, staffList }) {
  const router = useRouter();

  const [sName, setSName] = useState("");
  const [sEmail, setSEmail] = useState("");
  const [sPass, setSPass] = useState("");
  const [sRole, setSRole] = useState("staff");
  const [sTitle, setSTitle] = useState("");
  const [addMsg, setAddMsg] = useState("");
  const [addBusy, setAddBusy] = useState(false);

  const [salStaff, setSalStaff] = useState("");
  const [salMonthly, setSalMonthly] = useState("");
  const [salBonus, setSalBonus] = useState("");
  const [salDate, setSalDate] = useState("");
  const [salNotes, setSalNotes] = useState("");
  const [salMsg, setSalMsg] = useState("");
  const [salBusy, setSalBusy] = useState(false);

  async function addStaff(e) {
    e.preventDefault();
    setAddMsg("");
    setAddBusy(true);
    const res = await fetch("/api/staff/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: sEmail, password: sPass, full_name: sName, role: sRole, job_title: sTitle,
      }),
    });
    const data = await res.json();
    setAddBusy(false);
    if (!res.ok) { setAddMsg(data.error || "Could not add staff member."); return; }
    setAddMsg(sName + " added. They can sign in with the email and temporary password you set.");
    setSName(""); setSEmail(""); setSPass(""); setSRole("staff"); setSTitle("");
    router.refresh();
  }

  async function setSalary(e) {
    e.preventDefault();
    setSalMsg("");
    setSalBusy(true);
    const res = await fetch("/api/salary/set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        staff_id: salStaff,
        monthly_amount: Number(salMonthly),
        bonus: salBonus ? Number(salBonus) : null,
        effective_from: salDate || null,
        notes: salNotes,
      }),
    });
    const data = await res.json();
    setSalBusy(false);
    if (!res.ok) { setSalMsg(data.error || "Could not save salary."); return; }
    setSalMsg("Salary saved.");
    setSalMonthly(""); setSalBonus(""); setSalDate(""); setSalNotes("");
    router.refresh();
  }

  return (
    <div className="dash">
      <header className="dash-head">
        <div className="logo">
          <span className="script">Dr. Bagewadi's</span>
          <span className="main">Staff Portal</span>
        </div>
        <div className="dash-user">
          <a href="/staff/dashboard" className="signout-btn">← Dashboard</a>
        </div>
      </header>

      <main className="dash-body">
        <h1>Manage staff</h1>

        <section className="dash-card">
          <h2>Add a staff member</h2>
          <form onSubmit={addStaff} className="timeoff-form" style={{ maxWidth: 520 }}>
            <label>Full name<input value={sName} onChange={(e) => setSName(e.target.value)} required placeholder="e.g. Alka Patil" /></label>
            <label>Email<input type="email" value={sEmail} onChange={(e) => setSEmail(e.target.value)} required placeholder="alka@example.com" /></label>
            <label>Temporary password<input type="text" value={sPass} onChange={(e) => setSPass(e.target.value)} required placeholder="They can change it later" /></label>
            <div className="field-row">
              <label>Role
                <select value={sRole} onChange={(e) => setSRole(e.target.value)} className="mgmt-select">
                  <option value="staff">Staff</option>
                  <option value="owner">Owner</option>
                </select>
              </label>
              <label>Job title (optional)<input value={sTitle} onChange={(e) => setSTitle(e.target.value)} placeholder="e.g. Optometrist" /></label>
            </div>
            <button type="submit" className="dash-btn" disabled={addBusy}>{addBusy ? "Adding…" : "Add staff member"}</button>
            {addMsg && <span className="form-msg">{addMsg}</span>}
          </form>
        </section>

        <section className="dash-card">
          <h2>Set a salary</h2>
          <form onSubmit={setSalary} className="timeoff-form" style={{ maxWidth: 520 }}>
            <label>Staff member
              <select value={salStaff} onChange={(e) => setSalStaff(e.target.value)} required className="mgmt-select">
                <option value="">Choose…</option>
                {staffList.map((p) => (<option key={p.id} value={p.id}>{p.full_name}</option>))}
              </select>
            </label>
            <div className="field-row">
              <label>Monthly amount (₹)<input type="number" value={salMonthly} onChange={(e) => setSalMonthly(e.target.value)} required placeholder="15000" /></label>
              <label>Bonus (₹, optional)<input type="number" value={salBonus} onChange={(e) => setSalBonus(e.target.value)} placeholder="2000" /></label>
            </div>
            <div className="field-row">
              <label>Effective from<input type="date" value={salDate} onChange={(e) => setSalDate(e.target.value)} /></label>
              <label>Notes (optional)<input value={salNotes} onChange={(e) => setSalNotes(e.target.value)} placeholder="e.g. Annual increment" /></label>
            </div>
            <button type="submit" className="dash-btn" disabled={salBusy}>{salBusy ? "Saving…" : "Save salary"}</button>
            {salMsg && <span className="form-msg">{salMsg}</span>}
          </form>
        </section>

        <section className="dash-card">
          <h2>Current staff</h2>
          <table className="dash-table">
            <thead><tr><th>Name</th><th>Role</th><th>Job title</th></tr></thead>
            <tbody>
              {staffList.map((p) => (
                <tr key={p.id}>
                  <td>{p.full_name}</td>
                  <td>{p.role}</td>
                  <td className="muted">{p.job_title || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
EOF

# --- append select styling to staff-portal.css ---
cat >> app/staff-portal.css << 'EOF'

.mgmt-select{
  padding:11px 14px;border:1px solid var(--line);border-radius:10px;
  font-size:0.95rem;font-family:'Inter';background:var(--white);color:var(--ink);
}
.mgmt-select:focus{outline:none;border-color:var(--navy);}
.manage-link{
  background:var(--gold);color:#fff;padding:8px 16px;border-radius:9px;
  font-size:0.88rem;font-weight:500;transition:opacity .2s;
}
.manage-link:hover{opacity:0.88;}
EOF

echo "All files created successfully."
