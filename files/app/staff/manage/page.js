import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import ManageClient from "./ManageClient";

export default async function ManagePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/staff");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (profile?.role !== "owner") redirect("/staff/dashboard");

  // Everyone (for the roster with reactivate); payroll filters to active in the client
  const { data: everyone } = await supabase
    .from("profiles").select("*").order("full_name");

  const { data: allPay } = await supabase
    .from("salaries")
    .select("staff_id, monthly_amount, bonus, days_worked, leave_taken, pay_month")
    .order("pay_month", { ascending: false });

  const payByStaffMonth = {};
  (allPay || []).forEach((r) => {
    if (r.staff_id && r.pay_month) {
      const key = `${r.staff_id}__${String(r.pay_month).slice(0, 10)}`;
      payByStaffMonth[key] = {
        monthly_amount: r.monthly_amount ?? "",
        bonus: r.bonus ?? "",
        days_worked: r.days_worked ?? "",
        leave_taken: r.leave_taken ?? "",
      };
    }
  });

  return <ManageClient profile={profile} everyone={everyone || []} payByStaffMonth={payByStaffMonth} />;
}
