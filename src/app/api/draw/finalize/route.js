import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const TIER_ALLOCATION = {
  5: 0.4,
  4: 0.35,
  3: 0.25,
};

export async function POST(req) {
  try {
    const { draw_id } = await req.json();
    if (!draw_id) return NextResponse.json({ error: "draw_id is required" }, { status: 400 });

    const { data: draw, error: drawError } = await supabase.from("draws").select("*").eq("id", draw_id).single();
    if (drawError) throw drawError;
    if (!draw) return NextResponse.json({ error: "Draw not found" }, { status: 404 });
    if (draw.status !== "published") {
      return NextResponse.json({ error: "Draw must be published before finalization" }, { status: 400 });
    }

    const trending = await supabase
      .from("draws")
      .select("id, year, month")
      .lt("year", draw.year)
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .limit(1);

    const prevDraw = trending.data?.[0];

    let previousRollover = 0;
    if (prevDraw) {
      const { data: prevPool } = await supabase
        .from("prize_pools")
        .select("rollover_amount")
        .eq("draw_id", prevDraw.id)
        .single();
      previousRollover = Number(prevPool?.rollover_amount || 0);
    }

    const { data: participants } = await supabase
      .from("draw_participants")
      .select("user_id")
      .eq("draw_id", draw_id)
      .eq("is_eligible", true);

    const userIds = (participants || []).map((p) => p.user_id);

    // Get active subscriptions at draw time
    const { data: activeSubscriptions, error: subError } = await supabase
      .from("subscriptions")
      .select("id")
      .in("user_id", userIds)
      .eq("status", "active")
      .lte("start_date", draw.published_at || new Date().toISOString());

    if (subError) throw subError;

    const subscriptionIds = (activeSubscriptions || []).map((s) => s.id);

    // Sum prize pool from allocations of active subscriptions
    const { data: allocationRows, error: allocationError } = await supabase
      .from("subscription_allocations")
      .select("prize_pool_amount")
      .in("subscription_id", subscriptionIds);

    if (allocationError) throw allocationError;

    const totalPrizePool = (allocationRows || []).reduce((sum, x) => sum + Number(x.prize_pool_amount || 0), 0) + previousRollover;

    const match5Pool = Number((totalPrizePool * TIER_ALLOCATION[5]).toFixed(2));
    const match4Pool = Number((totalPrizePool * TIER_ALLOCATION[4]).toFixed(2));
    const match3Pool = Number((totalPrizePool * TIER_ALLOCATION[3]).toFixed(2));

    const { data: results } = await supabase
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
        rolloverAmount += pool;
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

    const { error: prizePoolError } = await supabase.from("prize_pools").insert({
      draw_id,
      total_pool: totalPrizePool,
      match_5_pool: match5Pool,
      match_4_pool: match4Pool,
      match_3_pool: match3Pool,
      rollover_amount: Number(rolloverAmount.toFixed(2)),
    });

    if (prizePoolError) throw prizePoolError;

    if (winnersToInsert.length > 0) {
      const { error: winnersError } = await supabase.from("winners").insert(winnersToInsert);
      if (winnersError) throw winnersError;
    }

    return NextResponse.json({
      draw_id,
      totalPrizePool,
      match5Pool,
      match4Pool,
      match3Pool,
      rolloverAmount,
      winnersCreated: winnersToInsert.length,
    });
  } catch (error) {
    console.error("/api/draw/finalize error", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
