"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

const INCOME_CATS = ["Consultation", "Surgery", "Procedure", "Optical / glasses", "Other income"];
const EXPENSE_CATS = ["Rent", "Supplies", "Equipment", "Utilities", "Maintenance", "Marketing", "Other expense"];

function monthKey(d) { return String(d).slice(0, 7); }
function monthLabel(key) {
  const [y, m] = key.split("-");
  const names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${names[Number(m) - 1]} ${y}`;
}
function shortMonth(key) {
  const [y, m] = key.split("-");
  const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${names[Number(m) - 1]} ${String(y).slice(2)}`;
}
function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function FinanceClient({ transactions, payrollByMonth }) {
  const router = useRouter();

  const [kind, setKind] = useState("expense");
  const [category, setCategory] = useState("");
  const [customCat, setCustomCat] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [filterMonth, setFilterMonth] = useState(currentMonthKey());

  const cats = kind === "income" ? INCOME_CATS : EXPENSE_CATS;

  // All months that have any data (transactions or payroll)
  const allMonths = useMemo(() => {
    const set = new Set();
    transactions.forEach((t) => set.add(monthKey(t.txn_date)));
    Object.keys(payrollByMonth).forEach((m) => set.add(m));
    set.add(currentMonthKey());
    return Array.from(set).sort().reverse();
  }, [transactions, payrollByMonth]);

  // Monthly aggregates for the summary + chart
  const monthly = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      const m = monthKey(t.txn_date);
      map[m] = map[m] || { income: 0, expense: 0, payroll: 0 };
      if (t.kind === "income") map[m].income += Number(t.amount) || 0;
      else map[m].expense += Number(t.amount) || 0;
    });
    Object.entries(payrollByMonth).forEach(([m, total]) => {
      map[m] = map[m] || { income: 0, expense: 0, payroll: 0 };
      map[m].payroll += total;
    });
    return map;
  }, [transactions, payrollByMonth]);

  const cur = monthly[filterMonth] || { income: 0, expense: 0, payroll: 0 };
  const totalExpense = cur.expense + cur.payroll;
  const net = cur.income - totalExpense;

  // Chart data: last 6 months chronological
  const chartData = useMemo(() => {
    return allMonths.slice(0, 6).reverse().map((m) => {
      const d = monthly[m] || { income: 0, expense: 0, payroll: 0 };
      return { month: shortMonth(m), Income: d.income, Expenses: d.expense + d.payroll };
    });
  }, [allMonths, monthly]);

  const monthTxns = useMemo(
    () => transactions.filter((t) => monthKey(t.txn_date) === filterMonth),
    [transactions, filterMonth]
  );

  const fmt = (n) => "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n || 0);
  const fmtDate = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  async function save(e) {
    e.preventDefault();
    setErr(""); setMsg("");
    const finalCat = category === "__custom__" ? customCat.trim() : category;
    if (!finalCat) { setErr("Choose or enter a category."); return; }
    setBusy(true);
    const res = await fetch("/api/finance/save", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, category: finalCat, amount, txn_date: date, note }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { setErr(data.error || "Could not save."); return; }
    setMsg("Saved.");
    setAmount(""); setNote(""); setCategory(""); setCustomCat("");
    router.refresh();
  }

  function exportMonth() {
    const rows = monthTxns.map((t) => ({
      Date: fmtDate(t.txn_date), Type: t.kind, Category: t.category,
      Amount: Number(t.amount), Note: t.note || "",
    }));
    // add payroll as a line
    if (cur.payroll > 0) rows.push({ Date: monthLabel(filterMonth), Type: "expense", Category: "Salaries (payroll)", Amount: cur.payroll, Note: "Auto from payroll" });
    if (rows.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Finance");
    XLSX.writeFile(wb, `finance-${filterMonth}.xlsx`);
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

      <main className="dash-body" style={{ maxWidth: 1000 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <h1>Finances</h1>
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="mgmt-select" style={{ width: 200 }}>
            {allMonths.map((m) => (<option key={m} value={m}>{monthLabel(m)}</option>))}
          </select>
        </div>

        {/* SUMMARY CARDS */}
        <div className="fin-cards">
          <div className="fin-card fin-income">
            <div className="fin-label">Income</div>
            <div className="fin-value">{fmt(cur.income)}</div>
          </div>
          <div className="fin-card fin-expense">
            <div className="fin-label">Expenses</div>
            <div className="fin-value">{fmt(totalExpense)}</div>
            <div className="fin-sub">incl. {fmt(cur.payroll)} payroll</div>
          </div>
          <div className={`fin-card ${net >= 0 ? "fin-net-pos" : "fin-net-neg"}`}>
            <div className="fin-label">Net {net >= 0 ? "profit" : "loss"}</div>
            <div className="fin-value">{fmt(Math.abs(net))}</div>
          </div>
        </div>

        {/* CHART */}
        <section className="dash-card">
          <h2>Income vs. expenses</h2>
          {chartData.length === 0 ? (
            <p className="empty">No data yet.</p>
          ) : (
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(23,58,99,0.08)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#5A6572" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#5A6572" }} tickFormatter={(v) => "₹" + (v >= 1000 ? (v/1000) + "k" : v)} />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend />
                  <Bar dataKey="Income" fill="#0F6E56" radius={[4,4,0,0]} />
                  <Bar dataKey="Expenses" fill="#C99A2E" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* RECORD FORM */}
        <section className="dash-card">
          <h2>Record a transaction</h2>
          <form onSubmit={save} className="timeoff-form" style={{ maxWidth: 560 }}>
            <div className="field-row">
              <label>Type
                <select value={kind} onChange={(e) => { setKind(e.target.value); setCategory(""); }} className="mgmt-select">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>
              <label>Category
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="mgmt-select" required>
                  <option value="">Choose…</option>
                  {cats.map((c) => (<option key={c} value={c}>{c}</option>))}
                  <option value="__custom__">+ Custom…</option>
                </select>
              </label>
            </div>
            {category === "__custom__" && (
              <label>Custom category<input value={customCat} onChange={(e) => setCustomCat(e.target.value)} placeholder="Type a category" /></label>
            )}
            <div className="field-row">
              <label>Amount (₹)<input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" required /></label>
              <label>Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></label>
            </div>
            <label>Note (optional)<input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Monthly rent" /></label>
            {err && <div className="login-error">{err}</div>}
            <button type="submit" className="dash-btn" disabled={busy}>{busy ? "Saving…" : "Save transaction"}</button>
            {msg && <span className="form-msg">{msg}</span>}
          </form>
        </section>

        {/* LEDGER */}
        <section className="dash-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <h2 style={{ margin: 0 }}>{monthLabel(filterMonth)} transactions</h2>
            {(monthTxns.length > 0 || cur.payroll > 0) && <button onClick={exportMonth} className="dl-btn">Download month</button>}
          </div>
          {monthTxns.length === 0 && cur.payroll === 0 ? (
            <p className="empty">No transactions for {monthLabel(filterMonth)}.</p>
          ) : (
            <table className="dash-table">
              <thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Note</th><th>Amount</th></tr></thead>
              <tbody>
                {monthTxns.map((t) => (
                  <tr key={t.id}>
                    <td>{fmtDate(t.txn_date)}</td>
                    <td><span className={`badge badge-${t.kind === "income" ? "approved" : "rejected"}`}>{t.kind}</span></td>
                    <td>{t.category}</td>
                    <td className="muted">{t.note || "—"}</td>
                    <td style={{ fontWeight: 500 }}>{fmt(t.amount)}</td>
                  </tr>
                ))}
                {cur.payroll > 0 && (
                  <tr>
                    <td className="muted">—</td>
                    <td><span className="badge badge-rejected">expense</span></td>
                    <td>Salaries (payroll)</td>
                    <td className="muted">Auto from payroll</td>
                    <td style={{ fontWeight: 500 }}>{fmt(cur.payroll)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
