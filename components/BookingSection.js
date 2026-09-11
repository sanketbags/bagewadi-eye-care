import { createClient } from "@/lib/supabase-server";
import BookingForm from "./BookingForm";

export default async function BookingSection() {
  const supabase = await createClient();
  const { data: setting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "booking_enabled")
    .maybeSingle();

  // Hidden entirely when booking is turned off
  if (setting?.value !== "true") return null;

  return (
    <section id="book" className="booking">
      <div className="wrap">
        <div className="head center" style={{ marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>
          <div className="kicker">Book a visit</div>
          <h2>Request an appointment</h2>
          <p style={{ color: "var(--muted)", marginTop: 10 }}>
            Tell us when suits you and we'll confirm your slot.
          </p>
        </div>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <BookingForm />
        </div>
      </div>
    </section>
  );
}
