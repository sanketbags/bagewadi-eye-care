"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function AccountPage() {
  const router = useRouter();
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function changePassword(e) {
    e.preventDefault();
    setMsg(""); setErr("");
    if (pw1.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (pw1 !== pw2) { setErr("The two passwords don't match."); return; }
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pw1 });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setMsg("Password changed successfully.");
    setPw1(""); setPw2("");
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
      <main className="dash-body" style={{ maxWidth: 520 }}>
        <h1>Your account</h1>
        <section className="dash-card">
          <h2>Change password</h2>
          <form onSubmit={changePassword} className="timeoff-form">
            <label>New password<input type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} placeholder="At least 6 characters" required /></label>
            <label>Confirm new password<input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Type it again" required /></label>
            {err && <div className="login-error">{err}</div>}
            <button type="submit" className="dash-btn" disabled={busy}>{busy ? "Saving…" : "Change password"}</button>
            {msg && <span className="form-msg">{msg}</span>}
          </form>
        </section>
      </main>
    </div>
  );
}
