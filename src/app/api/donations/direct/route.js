import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req) {
  try {
    const { user, error: authError, status } = await getUserFromRequest(req);
    if (authError) return NextResponse.json({ error: authError }, { status });

    const user_id = user.id;

    const { charity_id, amount } = await req.json();
    if (!charity_id || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "charity_id and positive amount are required" }, { status: 400 });
    }

    const { data: donation, error } = await supabase.from("charity_transactions").insert({
      user_id,
      charity_id,
      amount: Number(amount),
      source: "direct",
    }).select().single();

    if (error) throw error;

    return NextResponse.json({ donation }, { status: 201 });
  } catch (error) {
    console.error("/api/donations/direct POST error", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
