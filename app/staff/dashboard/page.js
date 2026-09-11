import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import DashboardClient from "./DashboardClient";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/staff");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const isOwner = profile?.role === "owner";

  const { data: salaries } = await supabase
    .from("salaries")
    .select("*, profiles!salaries_staff_id_fkey(full_name, job_title)")
    .order("effective_from", { ascending: false });

  const { data: timeOff } = await supabase
    .from("time_off_requests")
    .select("*, profiles!time_off_requests_staff_id_fkey(full_name)")
    .order("created_at", { ascending: false });

  let staffList = [];
  if (isOwner) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name");
    staffList = data || [];
  }

  return (
    <DashboardClient
      profile={profile}
      isOwner={isOwner}
      salaries={salaries || []}
      timeOff={timeOff || []}
      staffList={staffList}
    />
  );
}
