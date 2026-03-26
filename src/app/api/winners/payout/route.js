import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { winner_id } = await req.json();
    if (!winner_id) return NextResponse.json({ error: "winner_id is required" }, { status: 400 });

    const { data: winner } = await supabase.from("winners").select("*").eq("id", winner_id).single();
    if (!winner) return NextResponse.json({ error: "Winner not found" }, { status: 404 });
    if (winner.status !== "approved") {
      return NextResponse.json({ error: "Winner is not approved for payout" }, { status: 400 });
    }

    const { error: updateError } = await supabase.from("winners").update({ status: "paid" }).eq("id", winner_id);
    if (updateError) throw updateError;

    return NextResponse.json({ message: "Winner payout status updated to paid" });
  } catch (error) {
    console.error("/api/winners/payout POST error", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
