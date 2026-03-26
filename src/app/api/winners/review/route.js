import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function PATCH(req) {
  try {
    const { winner_id, action } = await req.json();
    if (!winner_id || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "winner_id and valid action are required" }, { status: 400 });
    }

    const { data: winner } = await supabase.from("winners").select("*").eq("id", winner_id).single();
    if (!winner) return NextResponse.json({ error: "Winner not found" }, { status: 404 });

    const status = action === "approve" ? "approved" : "rejected";
    const { error: updateError } = await supabase.from("winners").update({ status }).eq("id", winner_id);
    if (updateError) throw updateError;

    const reviewStatus = action === "approve" ? "approved" : "rejected";
    const { error: proofUpdateError } = await supabase
      .from("proofs")
      .update({ status: reviewStatus, reviewed_at: new Date().toISOString() })
      .eq("winner_id", winner_id);

    if (proofUpdateError) throw proofUpdateError;

    return NextResponse.json({ message: `Winner ${action}d successfully` });
  } catch (error) {
    console.error("/api/winners/review PATCH error", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
