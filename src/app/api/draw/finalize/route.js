import { createClient } from "@supabase/supabase-js";
import { validateAdminToken, unauthorizedResponse } from "@/lib/adminAuth";
import { getUserFromRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TIER_ALLOCATION = {
  5: 0.4,
  4: 0.35,
  3: 0.25,
};

export async function POST(req) {
  try {
    if (!validateAdminToken(req)) {
      const { profile, error: authError } = await getUserFromRequest(req);
      if (authError || !profile?.is_admin) {
        return unauthorizedResponse();
      }
    }

    const { draw_id } = await req.json();
    if (!draw_id) return NextResponse.json({ error: "draw_id is required" }, { status: 400 });

    const { data: draw, error: drawError } = await adminSupabase.from("draws").select("*").eq("id", draw_id).single();
    if (drawError) throw drawError;
    if (!draw) return NextResponse.json({ error: "Draw not found" }, { status: 404 });
    if (draw.status !== "published") {
      return NextResponse.json({ error: "Draw must be published before finalization" }, { status: 400 });
    }

    // Rollover logic
    const { data: previousDrawPool } = await adminSupabase
      .from("prize_pools")
      .select("rollover_amount")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const previousRollover = Number(previousDrawPool?.rollover_amount || 0);

    const { data: participants } = await adminSupabase
      .from("draw_participants")
      .select("user_id")
      .eq("draw_id", draw_id)
      .eq("is_eligible", true);

    const userIds = (participants || []).map((p) => p.user_id);

    // Filter active subscriptions
    const { data: activeSubscriptions, error: subError } = await adminSupabase
      .from("subscriptions")
      .select("id")
      .in("user_id", userIds)
      .eq("status", "active");

    if (subError) throw subError;
    const subscriptionIds = (activeSubscriptions || []).map((s) => s.id);

    // Calculate total pool
    const { data: allocationRows, error: allocationError } = await adminSupabase
      .from("subscription_allocations")
      .select("prize_pool_amount")
      .in("subscription_id", subscriptionIds);

    if (allocationError) throw allocationError;

    const currentTotal = (allocationRows || []).reduce((sum, x) => sum + Number(x.prize_pool_amount || 0), 0);
    const totalPrizePool = currentTotal + previousRollover;

    const match5Pool = Number((totalPrizePool * TIER_ALLOCATION[5]).toFixed(2));
    const match4Pool = Number((totalPrizePool * TIER_ALLOCATION[4]).toFixed(2));
    const match3Pool = Number((totalPrizePool * TIER_ALLOCATION[3]).toFixed(2));

    const { data: results } = await adminSupabase
      .from("draw_results")
      .select("user_id,matched_count")
      .eq("draw_id", draw_id)
      .gte("matched_count", 3);

    const tierCount = { 5: 0, 4: 0, 3: 0 };
    (results || []).forEach((r) => {
      if ([3, 4, 5].includes(r.matched_count)) tierCount[r.matched_count] += 1;
    });

    const winnersToInsert = [];
    let rolloverAmount = 0;

    Object.entries({ 5: match5Pool, 4: match4Pool, 3: match3Pool }).forEach(([tier, pool]) => {
      const count = tierCount[tier];
      if (count === 0) {
        if (tier === "5") rolloverAmount += pool; // Requirement: Only 5-match jackpot rolls over
        return;
      }
      const perWinner = Number((pool / count).toFixed(2));

      (results || [])
        .filter((r) => Number(r.matched_count) === Number(tier))
        .forEach((r) => {
          winnersToInsert.push({
            draw_id,
            user_id: r.user_id,
            match_type: `match_${tier}`,
            prize_amount: perWinner,
            status: "pending",
          });
        });
    });

    await adminSupabase.from("prize_pools").insert({
      draw_id,
      total_pool: totalPrizePool,
      match_5_pool: match5Pool,
      match_4_pool: match4Pool,
      match_3_pool: match3Pool,
      rollover_amount: Number(rolloverAmount.toFixed(2)),
    });

    if (winnersToInsert.length > 0) {
      await adminSupabase.from("winners").insert(winnersToInsert);
    }

    await adminSupabase.from("draws").update({ status: "finalized" }).eq("id", draw.id);

    return NextResponse.json({
      draw_id,
      totalPrizePool,
      winnersCreated: winnersToInsert.length,
      rolloverAmount
    });
  } catch (error) {
    console.error("/api/draw/finalize error", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
