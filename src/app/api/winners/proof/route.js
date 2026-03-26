import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { winner_id, file_url } = await req.json();
    if (!winner_id || !file_url) {
      return NextResponse.json({ error: "winner_id and file_url are required" }, { status: 400 });
    }

    const { data: winner } = await supabase.from("winners").select("*").eq("id", winner_id).single();
    if (!winner) return NextResponse.json({ error: "Winner record not found" }, { status: 404 });

    const { error: proofError } = await supabase.from("proofs").insert({ winner_id, file_url });
    if (proofError) throw proofError;

    const { error: updateError } = await supabase
      .from("winners")
      .update({ status: "pending" })
      .eq("id", winner_id);
    if (updateError) throw updateError;

    return NextResponse.json({ message: "Proof uploaded successfully" }, { status: 201 });
  } catch (error) {
    console.error("/api/winners/proof POST error", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
