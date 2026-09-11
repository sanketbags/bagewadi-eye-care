"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import * as XLSX from "xlsx";

function monthLabelFromValue(value) {
  if (!value) return "—";
  const [y, m] = String(value).slice(0, 10).split("-");
  const names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${names[Number(m) - 1]} ${y}`;
}
function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export default function DashboardClient({ profile, isOwner, salaries, timeOff, staffList }) {
  const router = useRouter();
  const supabase = createClient();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");

  const payMonths = useMemo(() => {
    const set = new Set();
    salaries.forEach((s) => { if (s.pay_month) set.add(String(s.pay_month).slice(0, 10)); });
    return Array.from(set).sort().reverse();
  }, [salaries]);

  const cur = currentMonthValue();
  const [filterMonth, setFilterMonth] = useState(
    payMonths.includes(cur) ? cur : (payMonths[0] || cur)
  );

  const shownSalaries = useMemo(
    () => salaries.filter((s) => String(s.pay_month).slice(0, 10) === filterMonth),
    [salaries, filterMonth]
  );

  const money = (a) => (a == null ? "—" : "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(a));
  const total = (s) => (Number(s.monthly_amount) || 0) + (Number(s.bonus) || 0);
  const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  // Build a plain-object row for Excel (numbers, not formatted strings)
  function toExcelRows(rows) {
    return rows.map((s) => {
      const r = {};
      r["Month"] = monthLabelFromValue(s.pay_month);
      if (isOwner) r["Staff"] = s.profiles?.full_name || "";
      r["Base"] = Number(s.monthly_amount) || 0;
      r["Bonus"] = Number(s.bonus) || 0;
      r["Days worked"] = s.days_worked ?? "";
      r["Leave"] = s.leave_taken ?? "";
      r["Total"] = total(s);
      return r;
    });
  }

  function downloadExcel(rows, filename) {
    if (rows.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(toExcelRows(rows));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pay records");
    XLSX.writeFile(wb, filename);
  }

  function downloadMonth() {
    downloadExcel(shownSalaries, `pay-${filterMonth}.xlsx`);
  }
  function downloadAll() {
    downloadExcel(salaries, `pay-all-records.xlsx`);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/staff");
    router.refresh();
  }

  async function submitTimeOff(e) {
    e.preventDefault();
    setMsg("");
    const { error } = await supabase.from("time_off_requests").insert({
      staff_id: profile.id, start_date: startDate, end_date: endDate, reason,
    });
    if (error) {
      setMsg("Something went wrong. Please try again.");
    } else {
      setStartDate(""); setEndDate(""); setReason(""); setMsg("Request submitted.");
      router.refresh();
    }
  }

  async function review(id, status) {
    await supabase.from("time_off_requests")
      .update({ status, reviewed_by: profile.id, reviewed_at: new Date().toISOString() })
      .eq("id", id);
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
          <span>{profile?.full_name} · {isOwner ? "Owner" : "Staff"}</span>
          {isOwner && <a href="/staff/manage" className="manage-link">Manage staff</a>}
          <a href="/staff/account" className="account-link">Account</a>
          <button onClick={signOut} className="signout-btn">Sign out</button>
        </div>
      </header>

      <main className="dash-body">
        <h1>Welcome, {profile?.full_name?.split(" ")[0]}.</h1>

        <section className="dash-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <h2 style={{ margin: 0 }}>{isOwner ? "Monthly pay records" : "Your monthly pay"}</h2>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {payMonths.length > 0 && (
                <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="mgmt-select" style={{ width: 190 }}>
                  {payMonths.map((m) => (<option key={m} value={m}>{monthLabelFromValue(m)}</option>))}
                </select>
              )}
              {shownSalaries.length > 0 && (
                <button type="button" onClick={downloadMonth} className="dl-btn">Download this month</button>
              )}
              {salaries.length > 0 && (
                <button type="button" onClick={downloadAll} className="dl-btn dl-btn-ghost">Download all</button>
              )}
            </div>
          </div>
          {shownSalaries.length === 0 ? (
            <p className="empty">No pay records for {monthLabelFromValue(filterMonth)}.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    {isOwner && <th>Staff</th>}
                    <th>Base</th>
                    <th>Bonus</th>
                    <th>Days</th>
                    <th>Leave</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {shownSalaries.map((s) => (
                    <tr key={s.id}>
                      {isOwner && <td>{s.profiles?.full_name || "—"}</td>}
                      <td>{money(s.monthly_amount)}</td>
                      <td>{money(s.bonus)}</td>
                      <td className="muted">{s.days_worked ?? "—"}</td>
                      <td className="muted">{s.leave_taken ?? "—"}</td>
                      <td style={{ fontWeight: 500 }}>{money(total(s))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                        ) : (<span className="muted">—</span>)}
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
            <p className="muted" style={{ marginBottom: 16 }}>{staffList.length} people. Use “Manage staff” to record pay and add people.</p>
            <table className="dash-table">
              <thead><tr><th>Name</th><th>Role</th><th>Job title</th><th>Status</th></tr></thead>
              <tbody>
                {staffList.map((p) => (
                  <tr key={p.id}>
                    <td>{p.full_name}</td>
                    <td>{p.role}</td>
                    <td className="muted">{p.job_title || "—"}</td>
                    <td>{p.active === false ? <span className="badge badge-rejected">inactive</span> : <span className="badge badge-approved">active</span>}</td>
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
