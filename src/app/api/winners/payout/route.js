import { createClient } from "@supabase/supabase-js";
import { validateAdminToken, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    if (!validateAdminToken(req)) {
      return unauthorizedResponse();
    }

    const { winner_id } = await req.json();
    if (!winner_id) return NextResponse.json({ error: "winner_id is required" }, { status: 400 });

    const { data: winner, error: winnerError } = await adminSupabase.from("winners").select("*").eq("id", winner_id).single();
    if (winnerError || !winner) return NextResponse.json({ error: "Winner not found" }, { status: 404 });
    if (winner.status !== "approved") {
      return NextResponse.json({ error: "Winner is not approved for payout" }, { status: 400 });
    }

    // 1. Update winner status
    const { error: updateError } = await adminSupabase.from("winners").update({ status: "paid" }).eq("id", winner_id);
    if (updateError) throw updateError;

    // 2. Reduce the prize pool (By adding to distributed_amount)
    const prizeAmount = Number(winner.prize_amount);
    const { data: pool } = await adminSupabase.from("prize_pools").select("id, distributed_amount").eq("draw_id", winner.draw_id).single();
    
    if (pool) {
       const newDistributed = Number(pool.distributed_amount || 0) + prizeAmount;
       await adminSupabase.from("prize_pools").update({ distributed_amount: newDistributed }).eq("id", pool.id);
    }

    // 3. LOG PAYOUT
    await adminSupabase.from("admin_logs").insert({
       action: `payout_process`,
       entity_type: "winner",
       entity_id: winner_id,
       admin_id: "ADMIN"
    });

    return NextResponse.json({ message: "Winner payout status updated and pool adjusted", paid_amount: prizeAmount });
  } catch (error) {
    console.error("/api/winners/payout POST error", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
