export default function Contact() {
  return (
    <section id="contact">
      <div className="wrap">
        <div className="head">
          <div className="kicker">Visit us</div>
          <h2>We'd be glad to see you.</h2>
        </div>
        <div className="contact-grid">
          <div className="contact-info">
            <div className="info-row">
              <div className="info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <div className="label">Address</div>
                <div className="value">
                  1354, Basavan Galli, Raviwar Peth,<br />Belagavi, Karnataka 590002
                </div>
              </div>
            </div>
            <div className="info-row">
              <div className="info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0122 16.92z" />
                </svg>
              </div>
              <div>
                <div className="label">Phone</div>
                <div className="value">+91 95912 93838</div>
              </div>
            </div>
            <div className="info-row">
              <div className="info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <div>
                <div className="label">Hours</div>
                <div className="value">
                  Mon – Sat · 10:30 AM – 8:30 PM<br />Sunday closed
                </div>
              </div>
            </div>
          </div>
          <div className="map-box">
            <iframe
              src="https://www.google.com/maps?q=Dr+Bagewadi+Eye+Care+Centre+Belagavi&output=embed"
              loading="lazy"
              title="Clinic location"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
