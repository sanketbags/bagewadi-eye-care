import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AppointmentsClient from "./AppointmentsClient";

export default async function AppointmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/staff");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile) redirect("/staff");
  if (profile.active === false) { await supabase.auth.signOut(); redirect("/staff?deactivated=1"); }

  const isOwner = profile.role === "owner";

  const { data: appointments } = await supabase
    .from("appointments").select("*").order("created_at", { ascending: false });

  const { data: bookingSetting } = await supabase
    .from("settings").select("value").eq("key", "booking_enabled").maybeSingle();

  return (
    <AppointmentsClient
      profile={profile}
      isOwner={isOwner}
      appointments={appointments || []}
      bookingEnabled={bookingSetting?.value === "true"}
    />
  );
}
