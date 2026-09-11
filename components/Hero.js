"use client";

import { useEffect, useRef } from "react";

const CX = 170, CY = 170, N = 8, OR = 168, RC = 44, RO = 72;

function blade(deg, r) {
  const a = (deg * Math.PI) / 180;
  const sp = ((360 / N) * Math.PI) / 180 / 2.3;
  const p = (rad, ang) => [CX + rad * Math.cos(ang), CY + rad * Math.sin(ang)];
  const [x1, y1] = p(OR, a - sp);
  const [x2, y2] = p(OR, a + sp);
  const [ix1, iy1] = p(r, a - sp);
  const [ix2, iy2] = p(r, a + sp);
  return `M ${ix1} ${iy1} L ${x1} ${y1} L ${x2} ${y2} L ${ix2} ${iy2} Z`;
}

export default function Hero() {
  const groupRef = useRef(null);

  useEffect(() => {
    const g = groupRef.current;
    if (!g) return;
    for (let i = 0; i < N; i++) {
      const deg = (360 / N) * i;
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("fill", i % 2 ? "#1F4677" : "#173A63");
      path.setAttribute("opacity", "0.92");
      path.setAttribute("d", blade(deg, RC));
      path.style.transition = "d 1.5s cubic-bezier(.16,.84,.44,1)";
      path.dataset.deg = deg;
      g.appendChild(path);
    }
    const timer = setTimeout(() => {
      g.querySelectorAll("path").forEach((p) =>
        p.setAttribute("d", blade(parseFloat(p.dataset.deg), RO))
      );
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="hero">
      <div className="hero-bg"></div>
      <div className="hero-inner">
        <div>
          <span className="hero-tag">
            <span className="dot"></span> Ophthalmology in Belagavi, Karnataka
          </span>
          <h1>
            Clearer vision,<br />in caring <span className="accent">family</span> hands.
          </h1>
          <p className="lead">
            Two generations of ophthalmologists caring for Belagavi's eyes — from
            everyday checkups to advanced surgery, with the warmth of a family
            practice.
          </p>
          <div className="hero-ctas">
            <a href="#contact" className="btn-primary">Book an appointment</a>
            <a href="#services" className="btn-ghost">Explore our care</a>
          </div>
        </div>
        <div className="aperture-wrap">
          <div className="aperture-glow"></div>
          <svg className="aperture" viewBox="0 0 340 340">
            <circle cx="170" cy="170" r="168" fill="none" stroke="var(--line)" strokeWidth="1" />
            <circle cx="170" cy="170" r="140" fill="none" stroke="var(--line)" strokeWidth="1" opacity="0.6" />
            <g ref={groupRef}></g>
            <circle cx="170" cy="170" r="44" fill="var(--gold)" />
            <circle cx="170" cy="170" r="44" fill="none" stroke="var(--navy)" strokeWidth="1.5" />
            <circle cx="158" cy="158" r="13" fill="rgba(255,255,255,0.4)" />
          </svg>
        </div>
      </div>
    </section>
  );
}
