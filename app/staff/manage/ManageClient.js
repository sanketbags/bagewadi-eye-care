"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

function monthOptions() {
  const opts = [];
  const now = new Date();
  for (let i = 0; i < 15; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    const label = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    opts.push({ value, label });
  }
  return opts;
}

export default function ManageClient({ profile, allActive, lastBase }) {
  const router = useRouter();
  const months = monthOptions();

  const [sName, setSName] = useState("");
  const [sEmail, setSEmail] = useState("");
  const [sPass, setSPass] = useState("");
  const [sRole, setSRole] = useState("staff");
  const [sTitle, setSTitle] = useState("");
  const [addMsg, setAddMsg] = useState("");
  const [addBusy, setAddBusy] = useState(false);

  const [payMonth, setPayMonth] = useState(months[0].value);
  const [includeOwners, setIncludeOwners] = useState(false);
  const [payMsg, setPayMsg] = useState("");
  const [payBusy, setPayBusy] = useState(false);

  // Who appears in payroll: staff always, owners only if toggled on
  const payrollPeople = useMemo(
    () => allActive.filter((p) => p.role === "staff" || (includeOwners && p.role === "owner")),
    [allActive, includeOwners]
  );

  const [rowData, setRowData] = useState({});
  function getRow(id) {
    return rowData[id] || { monthly_amount: lastBase[id] ?? "", bonus: "", days_worked: "", leave_taken: "" };
  }
  function updateRow(id, field, value) {
    setRowData((d) => ({ ...d, [id]: { ...getRow(id), [field]: value } }));
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
    setAddMsg(sName + " added. Refresh to include them in payroll.");
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
    setPayMsg(`Saved pay for ${data.saved} ${data.saved === 1 ? "person" : "people"}.`);
    router.refresh();
  }

  const total = (id) => {
    const r = getRow(id);
    return (Number(r.monthly_amount) || 0) + (Number(r.bonus) || 0);
  };
  const fmt = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

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

            {payrollPeople.length === 0 ? (
              <p className="empty">No staff to show. Add someone below first.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="dash-table payroll-table">
                  <thead>
                    <tr>
                      <th>Staff</th>
                      <th>Base (₹)</th>
                      <th>Bonus (₹)</th>
                      <th>Days worked</th>
                      <th>Leave</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollPeople.map((p) => {
                      const r = getRow(p.id);
                      return (
                        <tr key={p.id}>
                          <td>{p.full_name}{p.role === "owner" && <span className="muted"> (owner)</span>}</td>
                          <td><input type="number" className="pay-input" value={r.monthly_amount} onChange={(e) => updateRow(p.id, "monthly_amount", e.target.value)} placeholder="0" /></td>
                          <td><input type="number" className="pay-input" value={r.bonus} onChange={(e) => updateRow(p.id, "bonus", e.target.value)} placeholder="0" /></td>
                          <td><input type="number" className="pay-input" value={r.days_worked} onChange={(e) => updateRow(p.id, "days_worked", e.target.value)} placeholder="0" /></td>
                          <td><input type="number" className="pay-input" value={r.leave_taken} onChange={(e) => updateRow(p.id, "leave_taken", e.target.value)} placeholder="0" /></td>
                          <td style={{ fontWeight: 500 }}>₹{fmt(total(p.id))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 16 }}>
              <button type="submit" className="dash-btn" disabled={payBusy || payrollPeople.length === 0}>
                {payBusy ? "Saving…" : "Save this month's pay"}
              </button>
              {payMsg && <span className="form-msg">{payMsg}</span>}
            </div>
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
          <h2>Active staff</h2>
          <table className="dash-table">
            <thead><tr><th>Name</th><th>Role</th><th>Job title</th></tr></thead>
            <tbody>
              {allActive.map((p) => (
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
