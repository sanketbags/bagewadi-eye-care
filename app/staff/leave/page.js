import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import LeaveClient from "./LeaveClient";

const ANNUAL_LEAVE = 24; // days per year — adjust as the clinic's policy

export default async function LeavePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/staff");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile) redirect("/staff");
  const isOwner = profile.role === "owner";

  const year = new Date().getFullYear();
  const yStart = `${year}-01-01`;
  const yEnd = `${year}-12-31`;

  // Leave taken this year from payroll records (leave_taken per month)
  let salQuery = supabase
    .from("salaries")
    .select("staff_id, leave_taken, pay_month, profiles!salaries_staff_id_fkey(full_name)")
    .gte("pay_month", yStart).lte("pay_month", yEnd);
  if (!isOwner) salQuery = salQuery.eq("staff_id", user.id);
  const { data: sal } = await salQuery;

  // Sum leave per staff
  const byStaff = {};
  (sal || []).forEach((s) => {
    const id = s.staff_id;
    byStaff[id] = byStaff[id] || { name: s.profiles?.full_name || "—", taken: 0 };
    byStaff[id].taken += Number(s.leave_taken) || 0;
  });

  const rows = Object.values(byStaff).map((r) => ({
    ...r, allowance: ANNUAL_LEAVE, remaining: ANNUAL_LEAVE - r.taken,
  }));

  return <LeaveClient rows={rows} year={year} allowance={ANNUAL_LEAVE} isOwner={isOwner} />;
}
