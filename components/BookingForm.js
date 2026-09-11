"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-client";

export default function BookingForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(""); setMsg(""); setBusy(true);
    const res = await fetch("/api/appointments/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_name: name, phone, email,
        preferred_date: date, preferred_time: time, reason,
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { setErr(data.error || "Something went wrong. Please try again or call us."); return; }
    setDone(true);
  }

  if (done) {
    return (
      <div className="booking-done">
        <h3>Thank you, {name.split(" ")[0]}.</h3>
        <p>We've received your request and will confirm your appointment shortly by {email ? "email" : "phone"}.</p>
      </div>
    );
  }

  return (
    <form className="booking-form" onSubmit={submit}>
      <div className="booking-row">
        <label>Your name<input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name" /></label>
        <label>Phone<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" /></label>
      </div>
      <div className="booking-row">
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" /></label>
        <label>Preferred date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></label>
      </div>
      <div className="booking-row">
        <label>Preferred time<input value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g. Morning, or 4 PM" /></label>
        <label>Reason for visit<input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Routine checkup" /></label>
      </div>
      {err && <div className="booking-error">{err}</div>}
      <button type="submit" className="btn-primary" disabled={busy}>{busy ? "Sending…" : "Request appointment"}</button>
      <p className="booking-note">We'll confirm your slot by email or phone. This is a request, not a guaranteed booking.</p>
    </form>
  );
}
