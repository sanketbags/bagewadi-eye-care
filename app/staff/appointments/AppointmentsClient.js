"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function AppointmentsClient({ profile, isOwner, appointments, bookingEnabled }) {
  const router = useRouter();
  const supabase = createClient();

  const [booking, setBooking] = useState(bookingEnabled);
  const [confirming, setConfirming] = useState(null);
  const [cDate, setCDate] = useState("");
  const [cTime, setCTime] = useState("");
  const [cNote, setCNote] = useState("");
  const [cErr, setCErr] = useState("");

  const fmtDate = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/staff");
    router.refresh();
  }

  function to12h(t) {
    if (!t) return "";
    const [hStr, m] = t.split(":");
    let h = Number(hStr);
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ap}`;
  }

  function openConfirm(a) {
    setConfirming(a); setCDate(a.preferred_date || ""); setCTime(""); setCNote(""); setCErr("");
  }

  async function submitConfirm() {
    setCErr("");
    if (!cDate || !cTime) { setCErr("Please set both a date and a time."); return; }
    const confirmed_date_text = new Date(cDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const confirmed_time_text = to12h(cTime);
    const res = await fetch("/api/appointments/review", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: confirming.id, status: "confirmed", confirmed_date_text, confirmed_time_text, clinic_note: cNote }),
    });
    if (res.ok) { setConfirming(null); router.refresh(); }
    else { const d = await res.json(); setCErr(d.error || "Could not confirm."); }
  }

  async function declineAppt(id) {
    const res = await fetch("/api/appointments/review", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "declined" }),
    });
    if (res.ok) router.refresh();
  }

  async function toggleBooking() {
    const next = !booking;
    setBooking(next);
    const res = await fetch("/api/settings/toggle-booking", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: next }),
    });
    if (!res.ok) setBooking(!next);
    router.refresh();
  }

  const pending = appointments.filter((a) => a.status === "pending");
  const others = appointments.filter((a) => a.status !== "pending");

  return (
    <div className="dash">
      <header className="dash-head">
        <div className="logo">
          <span className="script">Dr. Bagewadi's</span>
          <span className="main">Staff Portal</span>
        </div>
        <div className="dash-user">
          <a href="/staff/dashboard" className="signout-btn">← Dashboard</a>
          <button onClick={signOut} className="signout-btn">Sign out</button>
        </div>
      </header>

      <main className="dash-body">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <h1>Appointments</h1>
          {isOwner && (
            <div className="appt-toggle">
              Online booking
              <button type="button" onClick={toggleBooking} className={`toggle-switch ${booking ? "on" : ""}`} aria-label="Toggle booking">
                <span className="toggle-knob" />
              </button>
              {booking ? "on" : "off"}
            </div>
          )}
        </div>

        <section className="dash-card" style={{ marginTop: 24 }}>
          <h2>Pending requests {pending.length > 0 && <span className="badge badge-pending" style={{ marginLeft: 8, fontSize: "0.75rem" }}>{pending.length}</span>}</h2>
          {pending.length === 0 ? (
            <p className="empty">No pending requests.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="dash-table">
                <thead><tr><th>Patient</th><th>Contact</th><th>Requested</th><th>Reason</th><th>Action</th></tr></thead>
                <tbody>
                  {pending.map((a) => (
                    <tr key={a.id}>
                      <td>{a.patient_name}</td>
                      <td className="muted" style={{ fontSize: "0.85rem" }}>
                        {a.phone && <div>{a.phone}</div>}
                        {a.email && <div>{a.email}</div>}
                      </td>
                      <td>{fmtDate(a.preferred_date)}{a.preferred_time ? `, ${a.preferred_time}` : ""}</td>
                      <td className="muted">{a.reason || "—"}</td>
                      <td>
                        <div className="action-btns">
                          <button onClick={() => openConfirm(a)} className="approve">Confirm</button>
                          <button onClick={() => declineAppt(a.id)} className="reject">Decline</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="dash-card">
          <h2>Confirmed &amp; past</h2>
          {others.length === 0 ? (
            <p className="empty">Nothing here yet.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="dash-table">
                <thead><tr><th>Patient</th><th>Contact</th><th>Scheduled</th><th>Reason</th><th>Status</th></tr></thead>
                <tbody>
                  {others.map((a) => (
                    <tr key={a.id}>
                      <td>{a.patient_name}</td>
                      <td className="muted" style={{ fontSize: "0.85rem" }}>
                        {a.phone && <div>{a.phone}</div>}
                        {a.email && <div>{a.email}</div>}
                      </td>
                      <td>
                        {a.confirmed_time_text
                          ? <div style={{ color: "#0F6E56" }}>{a.confirmed_date_text}, {a.confirmed_time_text}</div>
                          : <span className="muted">{fmtDate(a.preferred_date)}{a.preferred_time ? `, ${a.preferred_time}` : ""}</span>}
                        {a.clinic_note && <div className="muted" style={{ fontSize: "0.8rem", marginTop: 3 }}>Note: {a.clinic_note}</div>}
                      </td>
                      <td className="muted">{a.reason || "—"}</td>
                      <td><span className={`badge badge-${a.status === "confirmed" ? "approved" : "rejected"}`}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {confirming && (
        <div className="modal-overlay" onClick={() => setConfirming(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 6 }}>Confirm appointment</h2>
            <p className="muted" style={{ marginBottom: 18, fontSize: "0.9rem" }}>
              {confirming.patient_name} requested {fmtDate(confirming.preferred_date)}{confirming.preferred_time ? `, ${confirming.preferred_time}` : ""}.
            </p>
            <div className="timeoff-form">
              <div className="field-row">
                <label>Date<input type="date" value={cDate} onChange={(e) => setCDate(e.target.value)} /></label>
                <label>Time<input type="time" value={cTime} onChange={(e) => setCTime(e.target.value)} /></label>
              </div>
              <label>Note to patient (optional)<input value={cNote} onChange={(e) => setCNote(e.target.value)} placeholder="e.g. Please arrive 10 minutes early" /></label>
              {cErr && <div className="login-error">{cErr}</div>}
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button onClick={submitConfirm} className="dash-btn">Confirm &amp; set time</button>
                <button onClick={() => setConfirming(null)} className="signout-btn">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
