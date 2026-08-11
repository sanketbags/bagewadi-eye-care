// Edit this array to update doctor bios — no need to touch the layout below.
const doctors = [
  {
    role: "Founder · Senior Ophthalmologist",
    name: "Dr. Sameer A. Bagewadi",
    cred: "M.S. (Ophthalmology)",
    bio: "[A few sentences on the background, areas of focus (e.g. cataract, glaucoma), and philosophy of care.]",
  },
  {
    role: "Ophthalmologist",
    name: "Dr. Rasika Bagewadi",
    cred: "M.S. (Ophthalmology)",
    bio: "[A few sentences on the background, training, and any special interests — e.g. pediatric ophthalmology, LASIK, cornea.]",
  },
];

export default function About() {
  return (
    <section id="about">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">About Us</span>
          <h2>A practice built on two generations of care.</h2>
        </div>
        <div className="about-grid">
          {doctors.map((doc) => (
            <div className="doctor-card" key={doc.name}>
              <span className="role">{doc.role}</span>
              <h3>{doc.name}</h3>
              <div className="cred">{doc.cred}</div>
              <p>{doc.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
