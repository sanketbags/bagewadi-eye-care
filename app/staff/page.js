export default function StaffLogin() {
  return (
    <section style={{ padding: "140px 40px", textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
      <div className="kicker" style={{ color: "var(--gold)", fontWeight: 600, marginBottom: 14 }}>
        Staff Portal
      </div>
      <h1 style={{ color: "var(--navy)", fontSize: "2.4rem", marginBottom: "1rem" }}>Coming soon</h1>
      <p style={{ color: "var(--muted)", fontSize: "1.1rem" }}>
        This is where staff will log in to manage salary and time-off records.
        We'll wire this up in the next phase.
      </p>
      <p style={{ marginTop: "2rem" }}>
        <a href="/" style={{ color: "var(--navy)", fontWeight: 500 }}>← Back to home</a>
      </p>
    </section>
  );
}
