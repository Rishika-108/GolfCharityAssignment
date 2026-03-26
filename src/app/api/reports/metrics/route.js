import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const [{ data: totalUsers }, { data: activeSubs }, { data: totalRevenue }, { data: totalCharity }] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact" }),
      supabase.from("subscriptions").select("id", { count: "exact" }).eq("status", "active"),
      supabase.from("payments").select("amount", { aggregate: "sum" }),
      supabase.from("charity_transactions").select("amount", { aggregate: "sum" }),
    ]);

    const { data: monthlyEntries, error: monthlyError } = await supabase
      .from("prize_pools")
      .select("draw_id, total_pool, match_5_pool, match_4_pool, match_3_pool, rollover_amount, created_at")
      .order("created_at", { ascending: false });

    if (monthlyError) throw monthlyError;

    return NextResponse.json({
      total_users: totalUsers?.count || 0,
      active_subscriptions: activeSubs?.count || 0,
      total_revenue: totalRevenue?.data?.sum || 0,
      total_charity_donations: totalCharity?.data?.sum || 0,
      monthly_prize_pool: monthlyEntries || [],
    });
  } catch (error) {
    console.error("/api/reports/metrics GET error", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
