// Edit this array to update the service list — confirm which of these the
// clinic actually offers, and remove/add as needed.
const services = [
  {
    title: "Comprehensive Eye Exams",
    desc: "Routine vision testing, screening for common conditions, and personalized care plans.",
  },
  {
    title: "Cataract Surgery",
    desc: "Modern phacoemulsification with a range of lens options, from diagnosis through recovery.",
  },
  {
    title: "Glaucoma Management",
    desc: "Early detection and long-term monitoring to protect vision over time.",
  },
  {
    title: "LASIK & Refractive Surgery",
    desc: "Vision correction consultations and procedures for suitable candidates.",
  },
  {
    title: "Pediatric Eye Care",
    desc: "Vision screening and treatment tailored for children.",
  },
  {
    title: "Diabetic Retinopathy Care",
    desc: "Screening and management for patients with diabetes-related eye complications.",
  },
];

export default function Services() {
  return (
    <section className="services" id="services">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">What We Offer</span>
          <h2>Comprehensive eye care, under one roof.</h2>
        </div>
      </div>
      <div className="wrap">
        <div className="services-grid">
          {services.map((s, i) => (
            <div className="service-card" key={s.title}>
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
