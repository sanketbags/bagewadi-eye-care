import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import ManageClient from "./ManageClient";

export default async function ManagePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/staff");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (profile?.role !== "owner") redirect("/staff/dashboard");

  const { data: allActive } = await supabase
    .from("profiles").select("*").eq("active", true).order("full_name");

  const { data: allPay } = await supabase
    .from("salaries").select("staff_id, monthly_amount, pay_month")
    .order("pay_month", { ascending: false });

  // last base per staff (for prefill)
  const lastBase = {};
  // set of recorded months per staff (YYYY-MM-01 strings)
  const recordedMonths = {};
  (allPay || []).forEach((r) => {
    if (!r.staff_id) return;
    if (lastBase[r.staff_id] == null) lastBase[r.staff_id] = r.monthly_amount;
    if (r.pay_month) {
      (recordedMonths[r.staff_id] = recordedMonths[r.staff_id] || []).push(r.pay_month);
    }
  });

  return <ManageClient profile={profile} allActive={allActive || []} lastBase={lastBase} recordedMonths={recordedMonths} />;
}
