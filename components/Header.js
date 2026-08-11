"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [onDark, setOnDark] = useState(false);

  // Invert the bar while the dark services band is the thing sitting directly
  // under it. The observer's root band is just the height of the header.
  useEffect(() => {
    const target = document.querySelector(".services");
    if (!target) return;

    let io;
    const attach = () => {
      if (io) io.disconnect();
      const headerH = document.querySelector("header")?.offsetHeight ?? 72;
      const bottom = Math.max(0, window.innerHeight - headerH);
      io = new IntersectionObserver(
        ([entry]) => setOnDark(entry.isIntersecting),
        { rootMargin: `0px 0px -${bottom}px 0px`, threshold: 0 }
      );
      io.observe(target);
    };

    attach();
    window.addEventListener("resize", attach);
    return () => {
      if (io) io.disconnect();
      window.removeEventListener("resize", attach);
    };
  }, []);

  return (
    <header className={onDark ? "on-dark" : undefined}>
      <nav>
        <a href="/" className="logo" aria-label="Dr. Bagewadi's Eye Care Centre">
          <span className="script">Dr. Bagewadi's</span>
          <span className="main">Eye Care Centre</span>
        </a>
        <div className={`nav-links${open ? " open" : ""}`}>
          <a href="#about" onClick={() => setOpen(false)}>About</a>
          <a href="#services" onClick={() => setOpen(false)}>Services</a>
          <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
          <a href="/staff" className="staff-link" onClick={() => setOpen(false)}>
            Staff Login →
          </a>
        </div>

        <button
          className="menu-toggle"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>
    </header>
  );
}
