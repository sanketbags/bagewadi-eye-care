"use client";

import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

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
          <a href="#book" className="nav-cta">Book a Visit</a>
        </div>
        <button className="menu-toggle" aria-label="Menu" onClick={() => setOpen(!open)}>
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {open && (
        <div className="mobile-menu">
          <a href="#about" onClick={() => setOpen(false)}>About</a>
          <a href="#services" onClick={() => setOpen(false)}>Services</a>
          <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
          <a href="/staff" onClick={() => setOpen(false)}>Staff Login</a>
          <a href="#book" onClick={() => setOpen(false)} className="mobile-book">Book a Visit</a>
        </div>
      )}
    </header>
  );
}
