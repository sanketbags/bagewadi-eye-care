import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import FinanceClient from "./FinanceClient";

export default async function FinancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/staff");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (profile?.role !== "owner") redirect("/staff/dashboard");

  const { data: transactions } = await supabase
    .from("transactions").select("*").order("txn_date", { ascending: false });

  // Payroll totals per month (base + bonus), to fold into expenses
  const { data: pay } = await supabase
    .from("salaries").select("monthly_amount, bonus, pay_month");

  const payrollByMonth = {};
  (pay || []).forEach((s) => {
    if (!s.pay_month) return;
    const m = String(s.pay_month).slice(0, 7); // YYYY-MM
    payrollByMonth[m] = (payrollByMonth[m] || 0) + (Number(s.monthly_amount) || 0) + (Number(s.bonus) || 0);
  });

  return <FinanceClient transactions={transactions || []} payrollByMonth={payrollByMonth} />;
}
