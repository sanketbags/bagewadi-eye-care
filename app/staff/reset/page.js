"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

function ResetInner() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Supabase sets a recovery session from the email link automatically.
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session));
    });
  }, []);

  async function setNewPassword(e) {
    e.preventDefault();
    setMsg(""); setErr("");
    if (pw1.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (pw1 !== pw2) { setErr("The two passwords don't match."); return; }
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pw1 });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setMsg("Password set. Redirecting to sign in…");
    setTimeout(() => router.push("/staff"), 1500);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span className="script">Dr. Bagewadi's</span>
          <span className="main">Eye Care Centre</span>
        </div>
        <h1>Set a new password</h1>
        {!ready ? (
          <p className="login-sub">Open this page from the reset link in your email. If you did and still see this, the link may have expired — request a new one.</p>
        ) : (
          <form onSubmit={setNewPassword}>
            <label>New password<input type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} placeholder="At least 6 characters" required /></label>
            <label>Confirm new password<input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Type it again" required /></label>
            {err && <div className="login-error">{err}</div>}
            <button type="submit" className="login-btn" disabled={busy}>{busy ? "Saving…" : "Set password"}</button>
            {msg && <p className="form-msg" style={{ marginTop: 14 }}>{msg}</p>}
          </form>
        )}
        <a href="/staff" className="login-back">← Back to sign in</a>
      </div>
    </div>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={<div className="login-page"><div className="login-card">Loading…</div></div>}>
      <ResetInner />
    </Suspense>
  );
}
