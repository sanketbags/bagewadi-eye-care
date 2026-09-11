export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-top">
          <div className="foot-logo">
            <span className="script">Dr. Bagewadi's</span>
            <span className="main">Eye Care Centre</span>
          </div>
          <div className="foot-cols">
            <div className="foot-col">
              <h4>Explore</h4>
              <a href="#about">About us</a>
              <a href="#services">Services</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="foot-col">
              <h4>Visit</h4>
              <a href="#contact">Belagavi, Karnataka</a>
              <a href="tel:+919591293838">+91 95912 93838</a>
              <a href="/staff">Staff login</a>
            </div>
          </div>
        </div>
        <div className="foot-bottom">
          <div>© {new Date().getFullYear()} Dr Bagewadi's Eye Care Centre</div>
          <div>Caring for Belagavi's vision</div>
        </div>
      </div>
    </footer>
  );
}
