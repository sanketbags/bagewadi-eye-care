// Edit this array to update doctor bios.
const doctors = [
  {
    initials: "SB",
    role: "Founder & Senior Ophthalmologist",
    name: "Dr. Sameer A. Bagewadi",
    cred: "M.S. (Ophthalmology)",
    bio: "[A warm few sentences on his background, areas of focus, and philosophy of care — ideally in his own voice.]",
  },
  {
    initials: "RB",
    role: "Ophthalmologist",
    name: "Dr. Rasika Bagewadi",
    cred: "M.S. (Ophthalmology)",
    bio: "[A warm few sentences on her background, training, and special interests — e.g. pediatric care, cornea, LASIK.]",
  },
];

export default function About() {
  return (
    <section className="about" id="about">
      <div className="wrap">
        <div className="head">
          <div className="kicker">The people behind the practice</div>
          <h2>Two generations, one commitment to your sight.</h2>
        </div>
        <div className="about-grid">
          {doctors.map((doc) => (
            <div className="doc-card" key={doc.name}>
              <div className="doc-avatar">{doc.initials}</div>
              <div className="role">{doc.role}</div>
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
