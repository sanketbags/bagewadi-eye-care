export default function Header() {
  return (
    <header>
      <nav>
        <div className="logo">
          <span className="script">Dr. Bagewadi's</span>
          <span className="main">Eye Care Centre</span>
        </div>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
          <a href="/staff" className="staff-link">Staff Login</a>
          <a href="#contact" className="nav-cta">Book a Visit</a>
        </div>
        <button className="menu-toggle" aria-label="Menu">☰</button>
      </nav>
    </header>
  );
}
