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

async function generateAlgorithmicDrawNumbers(participantIds) {
  if (participantIds.length === 0) return generateDrawNumbers();

  const { data: scores, error } = await adminSupabase
    .from("scores")
    .select("score")
    .in("user_id", participantIds)
    .order("played_at", { ascending: false })
    .limit(200);
  
  if (error || !scores || scores.length === 0) return generateDrawNumbers();

  const frequency = {};
  scores.forEach(s => {
    frequency[s.score] = (frequency[s.score] || 0) + 1;
  });

  const sorted = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .map(entry => Number(entry[0]));

  const result = [];
  for (let i = 0; i < 5; i++) {
    if (sorted[i]) {
      result.push(sorted[i]);
    } else {
      let rand;
      do {
        rand = Math.floor(Math.random() * 45) + 1;
      } while (result.includes(rand));
      result.push(rand);
    }
  }
  return result.sort((a, b) => a - b);
}

export async function GET(req) {
  try {
    if (!validateAdminToken(req)) {
      return unauthorizedResponse();
    }

    const { data: draws, error } = await adminSupabase
      .from("draws")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ draws: draws || [] });
  } catch (error) {
    console.error("/api/draw/run GET error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    if (!validateAdminToken(req)) {
      const { profile, error: authError, status } = await getUserFromRequest(req);
      if (authError || !profile?.is_admin) {
        return unauthorizedResponse();
      }
    }
    
    const now = new Date();
    const month = now.getUTCMonth() + 1;
    const year = now.getUTCFullYear();

    /* 
    // TESTING MODE: Disabling the "Once Per Month" limit for demonstration
    const { data: existing, error: existingError } = await adminSupabase
      .from("draws")
      .select("id")
      .eq("month", month)
      .eq("year", year)
      .single();

    if (existingError && existingError.code !== "PGRST116") throw existingError;
    if (existing) return NextResponse.json({ error: "Draw already exists for this month" }, { status: 400 });
    */

    const { draw_type = "random" } = await req.json().catch(() => ({}));

    const { data: activeSubUsers, error: activeSubError } = await adminSupabase
      .from("subscriptions")
      .select("user_id")
      .eq("status", "active");

    if (activeSubError) throw activeSubError;
    const activeUserIds = activeSubUsers.map((item) => item.user_id);

    const drawNumbers = draw_type === "algorithmic" 
        ? await generateAlgorithmicDrawNumbers(activeUserIds)
        : generateDrawNumbers();

    const { data: draw, error: drawError } = await adminSupabase
      .from("draws")
      .insert({ month, year, status: "pending", draw_numbers: drawNumbers, draw_type })
      .select()
      .single();
    if (drawError) throw drawError;

    const participantRecords = [];
    for (const userId of activeUserIds) {
      const { data: scoreRows, error: scoreError } = await adminSupabase
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
      await adminSupabase.from("draw_participants").insert(participantRecords);
      const results = [];
      for (const part of participantRecords) {
        const { data: scores } = await adminSupabase.from("scores").select("score").eq("user_id", part.user_id).order("played_at", { ascending: false }).limit(5);
        const userScores = (scores || []).map((item) => Number(item.score));
        const matches = userScores.filter((n) => drawNumbers.includes(n)).length;
        results.push({ draw_id: draw.id, user_id: part.user_id, matched_count: matches, is_winner: matches >= 3 });
      }
      await adminSupabase.from("draw_results").insert(results);
    }

    await adminSupabase.from("draws").update({ status: "published", is_locked: true, published_at: new Date().toISOString() }).eq("id", draw.id);
    return NextResponse.json({ draw, participants: participantRecords }, { status: 201 });
  } catch (error) {
    console.error("/api/draw/run error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
