import { createClient } from "@supabase/supabase-js";
import { validateAdminToken, unauthorizedResponse } from "@/lib/adminAuth";
import { getUserFromRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function generateDrawNumbers() {
  const numbers = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

export async function POST(req) {
  try {
    if (!validateAdminToken(req)) {
      const { profile, error: authError } = await getUserFromRequest(req);
      if (authError || !profile?.is_admin) {
        return unauthorizedResponse();
      }
    }

    const { draw_id } = await req.json();
    if (!draw_id) return NextResponse.json({ error: "draw_id is required" }, { status: 400 });

    const { data: draw, error: drawError } = await adminSupabase.from("draws").select("*").eq("id", draw_id).single();
    if (drawError) throw drawError;
    if (!draw) return NextResponse.json({ error: "Draw not found" }, { status: 404 });

    const numbers = generateDrawNumbers();

    const { data: participants, error: partErr } = await adminSupabase
      .from("draw_participants")
      .select("user_id")
      .eq("draw_id", draw_id)
      .eq("is_eligible", true);
    if (partErr) throw partErr;

    const results = [];
    for (const participant of participants || []) {
      const { data: scores } = await adminSupabase
        .from("scores")
        .select("score")
        .order("played_at", { ascending: false })
        .limit(5);

      const userScores = (scores || []).map((item) => Number(item.score));
      const matches = userScores.filter((n) => numbers.includes(n)).length;

      results.push({ user_id: participant.user_id, matched_count: matches });
    }

    await adminSupabase.from("draw_simulations").insert({
      draw_id,
      simulated_numbers: numbers,
      results_json: results,
    });

    return NextResponse.json({ draw_id, simulated_numbers: numbers, results });
  } catch (error) {
    console.error("/api/draw/simulate error", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
