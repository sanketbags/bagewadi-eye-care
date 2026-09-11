"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

function LoginInner() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState("");
  const [showReset, setShowReset] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const deactivated = params.get("deactivated") === "1";

  async function handleLogin(e) {
    e.preventDefault();
    setError(""); setResetMsg("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Those details don't match an account. Check your email and password.");
      return;
    }
    router.push("/staff/dashboard");
    router.refresh();
  }

  async function sendReset() {
    setError(""); setResetMsg("");
    if (!email) { setError("Enter your email above first, then click reset."); return; }
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/staff/reset`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) { setError(error.message); return; }
    setResetMsg("If that email has an account, a reset link is on its way. Check your inbox (and spam).");
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span className="script">Dr. Bagewadi's</span>
          <span className="main">Eye Care Centre</span>
        </div>
        <h1>Staff sign in</h1>
        <p className="login-sub">Access your salary and time-off details.</p>

        {deactivated && (
          <div className="login-error" style={{ marginBottom: 16 }}>
            This account is no longer active. Contact the clinic if this is a mistake.
          </div>
        )}

        <form onSubmit={handleLogin}>
          <label>Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </label>
          <label>Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required />
          </label>
          {error && <div className="login-error">{error}</div>}
          {resetMsg && <div className="form-msg">{resetMsg}</div>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <button type="button" onClick={sendReset} className="forgot-link">Forgot password?</button>

        <a href="/" className="login-back">← Back to website</a>
      </div>
    </div>
  );
}

export default function StaffLogin() {
  return (
    <Suspense fallback={<div className="login-page"><div className="login-card">Loading…</div></div>}>
      <LoginInner />
    </Suspense>
  );
}
