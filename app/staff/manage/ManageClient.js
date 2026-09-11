"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

function monthLabelFromValue(value) {
  const [y, m] = value.split("-");
  const names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${names[Number(m) - 1]} ${y}`;
}
function monthOptions() {
  const opts = [];
  const now = new Date();
  for (let i = 12; i >= -12; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    opts.push({ value, label: monthLabelFromValue(value) });
  }
  return opts;
}
function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

const EMPTY_ROW = { monthly_amount: "", bonus: "", days_worked: "", leave_taken: "" };

export default function ManageClient({ profile, everyone, payByStaffMonth }) {
  const router = useRouter();
  const months = monthOptions();

  const activeStaff = useMemo(() => everyone.filter((p) => p.active !== false), [everyone]);

  // Add staff
  const [sName, setSName] = useState("");
  const [sEmail, setSEmail] = useState("");
  const [sPass, setSPass] = useState("");
  const [sRole, setSRole] = useState("staff");
  const [sTitle, setSTitle] = useState("");
  const [addMsg, setAddMsg] = useState("");
  const [addBusy, setAddBusy] = useState(false);

  // Payroll
  const [payMonth, setPayMonth] = useState(currentMonthValue());
  const [includeOwners, setIncludeOwners] = useState(false);
  const [payMsg, setPayMsg] = useState("");
  const [payBusy, setPayBusy] = useState(false);

  const payrollPeople = useMemo(
    () => activeStaff.filter((p) => p.role === "staff" || (includeOwners && p.role === "owner")),
    [activeStaff, includeOwners]
  );

  const [edits, setEdits] = useState({});
  useEffect(() => { setEdits({}); setPayMsg(""); }, [payMonth]);

  function getRow(id) {
    if (edits[id]) return edits[id];
    return payByStaffMonth[`${id}__${payMonth}`] || EMPTY_ROW;
  }
  function updateRow(id, field, value) {
    const base = edits[id] || getRow(id);
    setEdits((d) => ({ ...d, [id]: { ...base, [field]: value } }));
  }
  const hasMonth = (id) => Boolean(payByStaffMonth[`${id}__${payMonth}`]);

  // Edit staff modal state
  const [editing, setEditing] = useState(null); // the profile being edited
  const [eName, setEName] = useState("");
  const [eTitle, setETitle] = useState("");
  const [eRole, setERole] = useState("staff");
  const [rowMsg, setRowMsg] = useState("");

  function openEdit(p) {
    setEditing(p); setEName(p.full_name || ""); setETitle(p.job_title || ""); setERole(p.role || "staff"); setRowMsg("");
  }
  async function saveEdit() {
    const res = await fetch("/api/staff/update", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editing.id, full_name: eName, job_title: eTitle, role: eRole }),
    });
    const data = await res.json();
    if (!res.ok) { setRowMsg(data.error || "Could not save."); return; }
    setEditing(null);
    router.refresh();
  }
  async function toggleActive(p) {
    const res = await fetch("/api/staff/toggle-active", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, active: p.active === false ? true : false }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error || "Could not update."); return; }
    router.refresh();
  }

  async function addStaff(e) {
    e.preventDefault();
    setAddMsg(""); setAddBusy(true);
    const res = await fetch("/api/staff/create", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: sEmail, password: sPass, full_name: sName, role: sRole, job_title: sTitle }),
    });
    const data = await res.json();
    setAddBusy(false);
    if (!res.ok) { setAddMsg(data.error || "Could not add staff member."); return; }
    setAddMsg(sName + " added.");
    setSName(""); setSEmail(""); setSPass(""); setSRole("staff"); setSTitle("");
    router.refresh();
  }

  async function savePayroll(e) {
    e.preventDefault();
    setPayMsg(""); setPayBusy(true);
    const rows = payrollPeople.map((p) => ({ staff_id: p.id, ...getRow(p.id) }));
    const res = await fetch("/api/payroll/save", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pay_month: payMonth, rows }),
    });
    const data = await res.json();
    setPayBusy(false);
    if (!res.ok) { setPayMsg(data.error || "Could not save payroll."); return; }
    setPayMsg(`Saved pay for ${data.saved} ${data.saved === 1 ? "person" : "people"} for ${monthLabelFromValue(payMonth)}.`);
    router.refresh();
  }

  const total = (id) => {
    const r = getRow(id);
    return (Number(r.monthly_amount) || 0) + (Number(r.bonus) || 0);
  };
  const fmt = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
  const anyRecorded = payrollPeople.some((p) => hasMonth(p.id));

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

      <main className="dash-body" style={{ maxWidth: 1100 }}>
        <h1>Manage staff</h1>

        <section className="dash-card">
          <h2>Record monthly pay</h2>
          <form onSubmit={savePayroll}>
            <div style={{ display: "flex", gap: 24, alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{ maxWidth: 280 }}>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, color: "var(--navy)", marginBottom: 7 }}>Pay month</label>
                <select value={payMonth} onChange={(e) => setPayMonth(e.target.value)} className="mgmt-select" style={{ width: 240 }}>
                  {months.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
                </select>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem", color: "var(--muted)", cursor: "pointer", paddingBottom: 4 }}>
                <input type="checkbox" checked={includeOwners} onChange={(e) => setIncludeOwners(e.target.checked)} />
                Include owners
              </label>
            </div>

            {anyRecorded && (
              <p className="muted" style={{ marginBottom: 14, fontSize: "0.9rem" }}>
                Rows marked “already recorded” have pay saved for {monthLabelFromValue(payMonth)}. Saving again overwrites them.
              </p>
            )}

            {payrollPeople.length === 0 ? (
              <p className="empty">No active staff. Add someone below first.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="dash-table payroll-table">
                  <thead>
                    <tr><th>Staff</th><th>Base (₹)</th><th>Bonus (₹)</th><th>Days worked</th><th>Leave</th><th>Total</th></tr>
                  </thead>
                  <tbody>
                    {payrollPeople.map((p) => {
                      const r = getRow(p.id);
                      return (
                        <tr key={p.id}>
                          <td>
                            {p.full_name}{p.role === "owner" && <span className="muted"> (owner)</span>}
                            {hasMonth(p.id) && <span className="badge badge-approved" style={{ marginLeft: 8, fontSize: "0.7rem" }}>already recorded</span>}
                          </td>
                          <td><input type="number" className="pay-input" value={r.monthly_amount} onChange={(e) => updateRow(p.id, "monthly_amount", e.target.value)} placeholder="—" /></td>
                          <td><input type="number" className="pay-input" value={r.bonus} onChange={(e) => updateRow(p.id, "bonus", e.target.value)} placeholder="—" /></td>
                          <td><input type="number" className="pay-input" value={r.days_worked} onChange={(e) => updateRow(p.id, "days_worked", e.target.value)} placeholder="—" /></td>
                          <td><input type="number" className="pay-input" value={r.leave_taken} onChange={(e) => updateRow(p.id, "leave_taken", e.target.value)} placeholder="—" /></td>
                          <td style={{ fontWeight: 500 }}>₹{fmt(total(p.id))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <button type="submit" className="dash-btn" disabled={payBusy || payrollPeople.length === 0}>
                {payBusy ? "Saving…" : `Save ${monthLabelFromValue(payMonth)} pay`}
              </button>
              {payMsg && <span className="form-msg">{payMsg}</span>}
            </div>
            {payrollPeople.length > 0 && (
              <div className="wage-total">
                <span className="wt-label">Total wage bill this month</span>
                <span className="wt-value">₹{fmt(payrollPeople.reduce((sum, p) => sum + total(p.id), 0))}</span>
              </div>
            )}
          </form>
        </section>

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
          <h2>All staff</h2>
          <table className="dash-table">
            <thead><tr><th>Name</th><th>Role</th><th>Job title</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {everyone.map((p) => (
                <tr key={p.id}>
                  <td>{p.full_name}</td>
                  <td>{p.role}</td>
                  <td className="muted">{p.job_title || "—"}</td>
                  <td>{p.active === false ? <span className="badge badge-rejected">inactive</span> : <span className="badge badge-approved">active</span>}</td>
                  <td>
                    <div className="action-btns">
                      <button onClick={() => openEdit(p)} className="row-btn">Edit</button>
                      {p.active === false ? (
                        <button onClick={() => toggleActive(p)} className="row-btn row-btn-green">Reactivate</button>
                      ) : (
                        <button onClick={() => toggleActive(p)} className="row-btn row-btn-red" disabled={p.id === profile.id}>Deactivate</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 18 }}>Edit {editing.full_name}</h2>
            <div className="timeoff-form">
              <label>Full name<input value={eName} onChange={(e) => setEName(e.target.value)} /></label>
              <label>Job title<input value={eTitle} onChange={(e) => setETitle(e.target.value)} placeholder="e.g. Optometrist" /></label>
              <label>Role
                <select value={eRole} onChange={(e) => setERole(e.target.value)} className="mgmt-select">
                  <option value="staff">Staff</option>
                  <option value="owner">Owner</option>
                </select>
              </label>
              {rowMsg && <span className="login-error">{rowMsg}</span>}
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button onClick={saveEdit} className="dash-btn">Save changes</button>
                <button onClick={() => setEditing(null)} className="signout-btn">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
