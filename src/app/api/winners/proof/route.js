import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { user, error: authError, status } = await getUserFromRequest(req);
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user_id = user.id;

    // We use a large limit for the JSON body to handle Base64
    const { winner_id, file_url } = await req.json();
    if (!winner_id || !file_url) {
      return NextResponse.json({ error: "winner_id and proof data are required" }, { status: 400 });
    }

    const { data: winner, error: winningErr } = await adminSupabase.from("winners").select("*").eq("id", winner_id).single();
    if (winningErr || !winner) return NextResponse.json({ error: "Winner record not found" }, { status: 404 });
    
    // IDOR protection
    if (winner.user_id !== user_id) {
       return NextResponse.json({ error: "Unauthorized access to winner record" }, { status: 403 });
    }

    // Insert into proofs
    const { error: proofError } = await adminSupabase.from("proofs").insert({ 
      winner_id, 
      file_url,
      status: 'pending'
    });
    if (proofError) throw proofError;

    // Update winner status
    const { error: updateError } = await adminSupabase
      .from("winners")
      .update({ status: "pending" }) // This triggers the admin "review" state
      .eq("id", winner_id);
    
    if (updateError) throw updateError;

    return NextResponse.json({ message: "Proof uploaded successfully", success: true }, { status: 201 });
  } catch (error) {
    console.error("/api/winners/proof POST error", error);
    return NextResponse.json({ error: "Server error during upload. Please try a smaller image." }, { status: 500 });
  }
}
