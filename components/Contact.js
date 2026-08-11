import Reveal from "@/components/Reveal";

export default function Contact() {
  return (
    <section id="contact">
      <div className="wrap">
        <Reveal as="div" className="section-head">
          <span className="eyebrow">Visit Us</span>
          <h2>Come see us, or reach out.</h2>
        </Reveal>
        <div className="contact-grid">
          <Reveal as="div">
            <div className="contact-block">
              <span className="label">Address</span>
              <div className="value">
                1354, Basavan Galli, Raviwar Peth, Belagavi, Karnataka 590002,
                India
              </div>
            </div>
            <div className="contact-block">
              <span className="label">Phone</span>
              <div className="value">+91 95912 93838</div>
            </div>
            <div className="contact-block">
              <span className="label">Email</span>
              <div className="value">[eyedentcare@gmail.com]</div>
            </div>
            <div className="contact-block">
              <span className="label">Hours</span>
              <div className="value">Mon–Sat, 10:30 AM – 8:30 PM · Sun Closed</div>
            </div>
          </Reveal>
          <Reveal as="div" className="map-placeholder">
            Map embed goes here
          </Reveal>
        </div>
      </div>
    </section>
  );
}
