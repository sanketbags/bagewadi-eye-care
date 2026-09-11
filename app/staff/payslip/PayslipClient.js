"use client";

function monthLabel(value) {
  if (!value) return "";
  const [y, m] = String(value).slice(0, 10).split("-");
  const names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${names[Number(m) - 1]} ${y}`;
}

export default function PayslipClient({ record, payMonth }) {
  if (!record) {
    return (
      <div style={{ padding: 60, textAlign: "center", fontFamily: "Inter, sans-serif" }}>
        <p>No pay record found for this month.</p>
        <a href="/staff/dashboard" style={{ color: "#173A63" }}>← Back</a>
      </div>
    );
  }

  const money = (a) => "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(a || 0);
  const base = Number(record.monthly_amount) || 0;
  const bonus = Number(record.bonus) || 0;
  const total = base + bonus;

  return (
    <div className="payslip-wrap">
      <div className="payslip-actions no-print">
        <a href="/staff/dashboard" className="signout-btn">← Back</a>
        <button onClick={() => window.print()} className="dash-btn">Print / Save as PDF</button>
      </div>

      <div className="payslip">
        <div className="payslip-head">
          <div>
            <div className="payslip-clinic">Dr. Bagewadi's Eye Care Centre</div>
            <div className="payslip-sub">1354, Basavan Galli, Raviwar Peth, Belagavi, Karnataka 590002</div>
          </div>
          <div className="payslip-title">Payslip</div>
        </div>

        <div className="payslip-meta">
          <div><span>Employee</span><b>{record.profiles?.full_name || "—"}</b></div>
          <div><span>Designation</span><b>{record.profiles?.job_title || "—"}</b></div>
          <div><span>Pay period</span><b>{monthLabel(payMonth)}</b></div>
        </div>

        <table className="payslip-table">
          <tbody>
            <tr><td>Base salary</td><td className="r">{money(base)}</td></tr>
            <tr><td>Bonus</td><td className="r">{money(bonus)}</td></tr>
            {record.days_worked != null && <tr><td>Days worked</td><td className="r">{record.days_worked}</td></tr>}
            {record.leave_taken != null && <tr><td>Leave taken</td><td className="r">{record.leave_taken}</td></tr>}
            {record.notes && <tr><td>Notes</td><td className="r">{record.notes}</td></tr>}
          </tbody>
          <tfoot>
            <tr><td>Total paid</td><td className="r">{money(total)}</td></tr>
          </tfoot>
        </table>

        <div className="payslip-foot">
          This is a computer-generated payslip and does not require a signature.
        </div>
      </div>
    </div>
  );
}
