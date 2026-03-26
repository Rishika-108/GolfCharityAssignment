import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { user_id, charity_id, amount } = await req.json();
    if (!user_id || !charity_id || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "user_id, charity_id and positive amount are required" }, { status: 400 });
    }

    const { data, error } = await supabase.from("charity_transactions").insert({
      user_id,
      charity_id,
      amount: Number(amount),
      source: "direct",
    }).single();

    if (error) throw error;

    return NextResponse.json({ donation: data }, { status: 201 });
  } catch (error) {
    console.error("/api/donations/direct POST error", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
