// Edit this array to update services. Each `icon` is the inner SVG paths.
const services = [
  {
    title: "Comprehensive Eye Exams",
    desc: "Thorough vision testing, screening, and a care plan built around you.",
    icon: <><circle cx="12" cy="12" r="3" /><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /></>,
  },
  {
    title: "Cataract Surgery",
    desc: "Modern phacoemulsification with premium lens options, start to recovery.",
    icon: <><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 000 18" /></>,
  },
  {
    title: "Glaucoma Management",
    desc: "Early detection and steady monitoring to protect your sight over time.",
    icon: <path d="M12 2s7 7 7 12a7 7 0 01-14 0c0-5 7-12 7-12z" />,
  },
  {
    title: "LASIK & Refractive",
    desc: "Vision correction consultations and procedures for the right candidates.",
    icon: <><path d="M2 12s3.5-7 10-7 10 7 10 7" /><circle cx="12" cy="12" r="3" /><path d="M4.5 19.5l15-15" /></>,
  },
  {
    title: "Pediatric Eye Care",
    desc: "Gentle vision screening and treatment made for little ones.",
    icon: <><circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 00-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 00-8-8z" /></>,
  },
  {
    title: "Diabetic Eye Care",
    desc: "Screening and care for diabetes-related changes in the retina.",
    icon: <><circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" /></>,
  },
];

export default function Services() {
  return (
    <section className="services" id="services">
      <div className="wrap">
        <div className="head">
          <div className="kicker">What we offer</div>
          <h2>Comprehensive eye care, under one roof.</h2>
        </div>
        <div className="svc-grid">
          {services.map((s) => (
            <div className="svc" key={s.title}>
              <div className="svc-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  {s.icon}
                </svg>
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
