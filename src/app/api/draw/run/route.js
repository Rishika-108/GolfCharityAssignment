import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function generateDrawNumbers() {
  const numbers = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

export async function POST() {
  try {
    const now = new Date();
    const month = now.getUTCMonth() + 1;
    const year = now.getUTCFullYear();

    const { data: existing, error: existingError } = await supabase
      .from("draws")
      .select("id")
      .eq("month", month)
      .eq("year", year)
      .single();

    if (existingError && existingError.code !== "PGRST116") {
      throw existingError;
    }
    if (existing) {
      return NextResponse.json({ error: "Draw already exists for this month" }, { status: 400 });
    }

    const drawNumbers = generateDrawNumbers();

    const { data: draw, error: drawError } = await supabase
      .from("draws")
      .insert({ month, year, status: "pending", draw_numbers: drawNumbers })
      .single();
    if (drawError) throw drawError;

    const { data: activeSubUsers, error: activeSubError } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("status", "active");

    if (activeSubError) throw activeSubError;

    const activeUserIds = activeSubUsers.map((item) => item.user_id);

    const participantRecords = [];
    for (const userId of activeUserIds) {
      const { data: scoreRows, error: scoreError } = await supabase
        .from("scores")
        .select("id")
        .eq("user_id", userId)
        .order("played_at", { ascending: false })
        .limit(5);

      if (scoreError) throw scoreError;
      if (scoreRows.length === 5) {
        participantRecords.push({ draw_id: draw.id, user_id: userId, is_eligible: true });
      }
    }

    if (participantRecords.length > 0) {
      const { error: insertParticipantsError } = await supabase.from("draw_participants").insert(participantRecords);
      if (insertParticipantsError) throw insertParticipantsError;

      const results = [];
      for (const part of participantRecords) {
        const { data: scores } = await supabase
          .from("scores")
          .select("score")
          .eq("user_id", part.user_id)
          .order("played_at", { ascending: false })
          .limit(5);

        const userScores = (scores || []).map((item) => Number(item.score));
        const matches = userScores.filter((n) => drawNumbers.includes(n)).length;

        results.push({
          draw_id: draw.id,
          user_id: part.user_id,
          matched_count: matches,
          is_winner: matches >= 3,
        });
      }

      const { error: drawResultsError } = await supabase.from("draw_results").insert(results);
      if (drawResultsError) throw drawResultsError;
    }

    const { error: updateDrawError } = await supabase
      .from("draws")
      .update({ status: "published", is_locked: true, published_at: new Date().toISOString() })
      .eq("id", draw.id);
    if (updateDrawError) throw updateDrawError;

    return NextResponse.json({ draw, participants: participantRecords }, { status: 201 });
  } catch (error) {
    console.error("/api/draw/run error", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
