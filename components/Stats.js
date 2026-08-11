import Reveal from "@/components/Reveal";

export default function Stats() {
  return (
    <Reveal as="div" className="strip">
      <div className="wrap">
        <div className="strip-item">
          <b>25+ years</b>
          <span>combined clinical experience</span>
        </div>
        <div className="strip-item">
          <b>[50,000+]</b>
          <span>patients treated</span>
        </div>
        <div className="strip-item">
          <b>Mon–Sat</b>
          <span>· 10:30 AM – 8:30 PM</span>
        </div>
      </div>
    </Reveal>
  );
}
