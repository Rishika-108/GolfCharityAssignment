import { createClient } from "@supabase/supabase-js";
import { validateAdminToken, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function PATCH(req) {
  try {
    if (!validateAdminToken(req)) {
      return unauthorizedResponse();
    }

    const { winner_id, action } = await req.json();
    if (!winner_id || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "winner_id and valid action are required" }, { status: 400 });
    }

    const { data: winner } = await adminSupabase.from("winners").select("*").eq("id", winner_id).single();
    if (!winner) return NextResponse.json({ error: "Winner not found" }, { status: 404 });

    const status = action === "approve" ? "approved" : "rejected";
    const { error: updateError } = await adminSupabase.from("winners").update({ status }).eq("id", winner_id);
    if (updateError) throw updateError;

    const reviewStatus = action === "approve" ? "approved" : "rejected";
    const { error: proofUpdateError } = await adminSupabase
      .from("proofs")
      .update({ status: reviewStatus, reviewed_at: new Date().toISOString() })
      .eq("winner_id", winner_id);

    if (proofUpdateError) throw proofUpdateError;

    // LOG ACTION
    await adminSupabase.from("admin_logs").insert({
       action: `winner_${action}`,
       entity_type: "winner",
       entity_id: winner_id,
       admin_id: "ADMIN"
    });

    return NextResponse.json({ message: `Winner ${action}d successfully` });
  } catch (error) {
    console.error("/api/winners/review PATCH error", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
