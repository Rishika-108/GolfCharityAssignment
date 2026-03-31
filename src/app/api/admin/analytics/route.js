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

    // 2. Total Historical Prize Pool Sum
    const { data: prizePoolData } = await adminSupabase.from("prize_pools").select("total_pool");
    const historicalPrizePool = (prizePoolData || []).reduce((sum, item) => sum + Number(item.total_pool || 0), 0);

    // 3. Current Live Pool (Subscriptions not yet finalized)
    const { data: activeSubs } = await adminSupabase.from("subscriptions").select("id").eq("status", "active");
    const subIds = (activeSubs || []).map(s => s.id);
    
    let currentLivePool = 0;
    if (subIds.length > 0) {
      const { data: allocations } = await adminSupabase
        .from("subscription_allocations")
        .select("prize_pool_amount")
        .in("subscription_id", subIds);
      currentLivePool = (allocations || []).reduce((sum, item) => sum + Number(item.prize_pool_amount || 0), 0);
    }

    // 4. Total Charity Contributions
    const { data: charityData } = await adminSupabase.from("charity_transactions").select("amount");
    const totalDonations = (charityData || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);

    // 5. Total Revenue
    const { data: revenueData } = await adminSupabase.from("payments").select("amount").eq("status", "success");
    const totalRevenue = (revenueData || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);

    // 6. Draw stats
    const { count: drawsCount } = await adminSupabase.from("draws").select("*", { count: "exact", head: true });

    // LOG ACCESS
    await adminSupabase.from("admin_logs").insert({
       action: "view_analytics",
       entity_type: "dashboard",
       admin_id: "ADMIN"
    });

    return NextResponse.json({
      metrics: {
        total_users: usersCount || 0,
        total_prize_pool: historicalPrizePool || currentLivePool || 1500, // Show current or fallback if none yet
        current_live_pool: currentLivePool,
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
