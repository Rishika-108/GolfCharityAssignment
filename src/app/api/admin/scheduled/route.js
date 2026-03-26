import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Subscription transitions past_due -> expired
    const { error: subError } = await supabase
      .from("subscriptions")
      .update({ status: "expired" })
      .eq("status", "past_due")
      .lte("created_at", sevenDaysAgo);

    if (subError) throw subError;

    // Proofs not uploaded after 7 days -> reject expected pending winners
    const { data: expiredProofs, error: proofError } = await supabase
      .from("winners")
      .select("id")
      .eq("status", "pending")
      .lte("created_at", sevenDaysAgo);

    if (proofError) throw proofError;

    const winnerIds = (expiredProofs || []).map((w) => w.id);
    if (winnerIds.length > 0) {
      const { error: updateWinnersError } = await supabase
        .from("winners")
        .update({ status: "rejected" })
        .in("id", winnerIds);
      if (updateWinnersError) throw updateWinnersError;

      const { error: updateProofsError } = await supabase
        .from("proofs")
        .update({ status: "rejected", reviewed_at: new Date().toISOString() })
        .in("winner_id", winnerIds);
      if (updateProofsError) throw updateProofsError;
    }

    return NextResponse.json({ message: "Scheduled tasks run successfully" });
  } catch (error) {
    console.error("/api/admin/scheduled POST error", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
