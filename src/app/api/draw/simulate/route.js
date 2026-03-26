import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function generateDrawNumbers() {
  const numbers = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

export async function POST(req) {
  try {
    const { draw_id } = await req.json();
    if (!draw_id) return NextResponse.json({ error: "draw_id is required" }, { status: 400 });

    const { data: draw, error: drawError } = await supabase.from("draws").select("*").eq("id", draw_id).single();
    if (drawError) throw drawError;
    if (!draw) return NextResponse.json({ error: "Draw not found" }, { status: 404 });

    const numbers = generateDrawNumbers();

    const { data: participants, error: partErr } = await supabase
      .from("draw_participants")
      .select("user_id")
      .eq("draw_id", draw_id)
      .eq("is_eligible", true);
    if (partErr) throw partErr;

    const results = [];
    for (const participant of participants || []) {
      const { data: scores } = await supabase
        .from("scores")
        .select("score")
        .eq("user_id", participant.user_id)
        .order("played_at", { ascending: false })
        .limit(5);

      const userScores = (scores || []).map((item) => Number(item.score));
      const matches = userScores.filter((n) => numbers.includes(n)).length;

      results.push({ user_id: participant.user_id, matched_count: matches });
    }

    const { error: simError } = await supabase.from("draw_simulations").insert({
      draw_id,
      simulated_numbers: numbers,
      results_json: results,
    });
    if (simError) throw simError;

    return NextResponse.json({ draw_id, simulated_numbers: numbers, results });
  } catch (error) {
    console.error("/api/draw/simulate error", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
