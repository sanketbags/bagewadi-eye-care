"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function DashboardClient({ profile, isOwner, salaries, timeOff, staffList }) {
  const router = useRouter();
  const supabase = createClient();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/staff");
    router.refresh();
  }

  async function submitTimeOff(e) {
    e.preventDefault();
    setMsg("");
    const { error } = await supabase.from("time_off_requests").insert({
      staff_id: profile.id,
      start_date: startDate,
      end_date: endDate,
      reason,
    });
    if (error) {
      setMsg("Something went wrong. Please try again.");
    } else {
      setStartDate("");
      setEndDate("");
      setReason("");
      setMsg("Request submitted.");
      router.refresh();
    }
  }

  async function review(id, status) {
    await supabase
      .from("time_off_requests")
      .update({ status, reviewed_by: profile.id, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    router.refresh();
  }

  const fmtMoney = (a, c) =>
    a == null
      ? "—"
      : new Intl.NumberFormat("en-IN", { style: "currency", currency: c || "INR", maximumFractionDigits: 0 }).format(a);
  const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="dash">
      <header className="dash-head">
        <div className="logo">
          <span className="script">Dr. Bagewadi's</span>
          <span className="main">Staff Portal</span>
        </div>
        <div className="dash-user">
          <span>{profile?.full_name} · {isOwner ? "Owner" : "Staff"}</span>
          <button onClick={signOut} className="signout-btn">Sign out</button>
        </div>
      </header>

      <main className="dash-body">
        <h1>Welcome, {profile?.full_name?.split(" ")[0]}.</h1>

        <section className="dash-card">
          <h2>{isOwner ? "Staff salaries" : "Your salary"}</h2>
          {salaries.length === 0 ? (
            <p className="empty">No salary records yet.</p>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  {isOwner && <th>Staff</th>}
                  <th>Monthly</th>
                  <th>Bonus</th>
                  <th>Effective from</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {salaries.map((s) => (
                  <tr key={s.id}>
                    {isOwner && <td>{s.profiles?.full_name || "—"}</td>}
                    <td>{fmtMoney(s.monthly_amount, s.currency)}</td>
                    <td>{fmtMoney(s.bonus, s.currency)}</td>
                    <td>{fmtDate(s.effective_from)}</td>
                    <td className="muted">{s.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {!isOwner && (
          <section className="dash-card">
            <h2>Request time off</h2>
            <form onSubmit={submitTimeOff} className="timeoff-form">
              <div className="field-row">
                <label>From<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required /></label>
                <label>To<input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required /></label>
              </div>
              <label>Reason (optional)<input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Family function" /></label>
              <button type="submit" className="dash-btn">Submit request</button>
              {msg && <span className="form-msg">{msg}</span>}
            </form>
          </section>
        )}

        <section className="dash-card">
          <h2>{isOwner ? "Time-off requests" : "Your time-off requests"}</h2>
          {timeOff.length === 0 ? (
            <p className="empty">No requests yet.</p>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  {isOwner && <th>Staff</th>}
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  {isOwner && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {timeOff.map((t) => (
                  <tr key={t.id}>
                    {isOwner && <td>{t.profiles?.full_name || "—"}</td>}
                    <td>{fmtDate(t.start_date)} – {fmtDate(t.end_date)}</td>
                    <td className="muted">{t.reason || "—"}</td>
                    <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                    {isOwner && (
                      <td>
                        {t.status === "pending" ? (
                          <div className="action-btns">
                            <button onClick={() => review(t.id, "approved")} className="approve">Approve</button>
                            <button onClick={() => review(t.id, "rejected")} className="reject">Reject</button>
                          </div>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {isOwner && (
          <section className="dash-card">
            <h2>Staff directory</h2>
            <p className="muted" style={{ marginBottom: 16 }}>{staffList.length} people. Add or edit staff and set salaries from the Supabase table editor for now — a full management screen comes next.</p>
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
        )}
      </main>
    </div>
  );
}
