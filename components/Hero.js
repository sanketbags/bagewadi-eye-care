"use client";

import { useEffect, useRef } from "react";

const CX = 170,
  CY = 170,
  BLADE_COUNT = 8,
  OUTER_R = 168,
  INNER_R_CLOSED = 46,
  INNER_R_OPEN = 70;

function bladePath(angleDeg, innerR) {
  const a = (angleDeg * Math.PI) / 180;
  const spread = ((360 / BLADE_COUNT) * Math.PI) / 180;
  const x1 = CX + OUTER_R * Math.cos(a - spread / 2.4);
  const y1 = CY + OUTER_R * Math.sin(a - spread / 2.4);
  const x2 = CX + OUTER_R * Math.cos(a + spread / 2.4);
  const y2 = CY + OUTER_R * Math.sin(a + spread / 2.4);
  const ix1 = CX + innerR * Math.cos(a - spread / 2.4);
  const iy1 = CY + innerR * Math.sin(a - spread / 2.4);
  const ix2 = CX + innerR * Math.cos(a + spread / 2.4);
  const iy2 = CY + innerR * Math.sin(a + spread / 2.4);
  return `M ${ix1} ${iy1} L ${x1} ${y1} L ${x2} ${y2} L ${ix2} ${iy2} Z`;
}

export default function Hero() {
  const bladeGroupRef = useRef(null);

  useEffect(() => {
    const group = bladeGroupRef.current;
    if (!group) return;

    // build closed blades
    for (let i = 0; i < BLADE_COUNT; i++) {
      const angle = (360 / BLADE_COUNT) * i;
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("class", "blade");
      path.setAttribute("fill", "#1A1713");
      path.setAttribute("opacity", "0.9");
      path.setAttribute("d", bladePath(angle, INNER_R_CLOSED));
      path.dataset.angle = angle;
      group.appendChild(path);
    }

    // animate open shortly after mount
    const timer = setTimeout(() => {
      group.querySelectorAll(".blade").forEach((b) => {
        const angle = parseFloat(b.dataset.angle);
        b.setAttribute("d", bladePath(angle, INNER_R_OPEN));
      });
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="hero">
      <div className="hero-inner">
        <div>
          <span className="eyebrow">Ophthalmology · Belagavi, India</span>
          <h1>
            Clear sight, <em>cared for</em> by family.
          </h1>
          <p className="lead">
            Two generations of ophthalmologists providing comprehensive eye care
            for Belagavi and surrounding areas — from routine exams to advanced
            surgical care.
          </p>
        </div>
        <div className="aperture-wrap">
          <svg className="aperture" viewBox="0 0 340 340" aria-hidden="true">
            <circle cx="170" cy="170" r="168" fill="none" stroke="var(--line)" strokeWidth="1" />
            <g ref={bladeGroupRef}></g>
            <circle cx="170" cy="170" r="46" fill="var(--accent)" opacity="0.9" />
            <circle cx="170" cy="170" r="46" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </section>
  );
}
