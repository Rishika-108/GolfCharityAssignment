import { createClient } from "@supabase/supabase-js";
import { validateAdminToken, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  try {
    if (!validateAdminToken(req)) {
      return unauthorizedResponse();
    }

    // 1. Total Users
    const { count: usersCount } = await adminSupabase.from("profiles").select("*", { count: "exact", head: true });

    // 2. Total Prize Pool Sum
    const { data: prizePoolData } = await adminSupabase.from("prize_pools").select("total_pool");
    const totalPrizePool = (prizePoolData || []).reduce((sum, item) => sum + Number(item.total_pool || 0), 0);

    // 3. Total Charity Contributions
    const { data: charityData } = await adminSupabase.from("charity_transactions").select("amount");
    const totalDonations = (charityData || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);

    // 4. Subscription allocations sum
    const { data: revenueData } = await adminSupabase.from("payments").select("amount").eq("status", "success");
    const totalRevenue = (revenueData || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);

    // 5. Draw stats
    const { count: drawsCount } = await adminSupabase.from("draws").select("*", { count: "exact", head: true });

    return NextResponse.json({
      metrics: {
        total_users: usersCount || 0,
        total_prize_pool: totalPrizePool,
        total_donations: totalDonations,
        total_revenue: totalRevenue,
        total_draws: drawsCount || 0
      }
    });
  } catch (error) {
    console.error("/api/admin/analytics GET error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
