import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import ManageClient from "./ManageClient";

export default async function ManagePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/staff");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (profile?.role !== "owner") redirect("/staff/dashboard");

  // All active people, we split staff vs owners in the client
  const { data: allActive } = await supabase
    .from("profiles").select("*").eq("active", true).order("full_name");

  const { data: recentPay } = await supabase
    .from("salaries").select("staff_id, monthly_amount, pay_month")
    .order("pay_month", { ascending: false });

  const lastBase = {};
  (recentPay || []).forEach((r) => {
    if (r.staff_id && lastBase[r.staff_id] == null) lastBase[r.staff_id] = r.monthly_amount;
  });

  return <ManageClient profile={profile} allActive={allActive || []} lastBase={lastBase} />;
}
