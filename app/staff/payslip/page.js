import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import PayslipClient from "./PayslipClient";

export default async function PayslipPage({ searchParams }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/staff");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile) redirect("/staff");

  const isOwner = profile.role === "owner";
  const sp = await searchParams;
  const staffId = sp?.staff || user.id;
  const payMonth = sp?.month; // YYYY-MM-01

  // Staff can only see their own; owners can see anyone's
  if (!isOwner && staffId !== user.id) redirect("/staff/payslip");

  const { data: record } = await supabase
    .from("salaries")
    .select("*, profiles!salaries_staff_id_fkey(full_name, job_title)")
    .eq("staff_id", staffId)
    .eq("pay_month", payMonth)
    .maybeSingle();

  return <PayslipClient record={record} payMonth={payMonth} />;
}
