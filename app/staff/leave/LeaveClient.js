"use client";

export default function LeaveClient({ rows, year, allowance, isOwner }) {
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
      <main className="dash-body">
        <h1>{isOwner ? "Leave balances" : "Your leave"} · {year}</h1>
        <p className="muted" style={{ marginBottom: 24 }}>
          Based on {allowance} days annual leave. Leave taken is summed from monthly payroll records.
        </p>
        {rows.length === 0 ? (
          <p className="empty">No leave data recorded yet this year.</p>
        ) : (
          <div className="leave-grid">
            {rows.map((r, i) => (
              <div className="leave-card" key={i}>
                <div className="ln">{r.name}</div>
                <div className="lb"><span>Allowance</span><b>{r.allowance} days</b></div>
                <div className="lb"><span>Taken</span><b>{r.taken} days</b></div>
                <div className="lb"><span>Remaining</span><b style={{ color: r.remaining < 0 ? "#A32D2D" : "#0F6E56" }}>{r.remaining} days</b></div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
