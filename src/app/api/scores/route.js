import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req) {
  try {
    const user_id = req.nextUrl.searchParams.get("user_id");
    if (!user_id) return NextResponse.json({ error: "user_id is required" }, { status: 400 });

    const { data: scores, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user_id)
      .order("played_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ scores });
  } catch (error) {
    console.error("/api/scores GET error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { user_id, score, played_at } = await req.json();

    if (!user_id || !Number.isInteger(score) || score < 1 || score > 45 || !played_at) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const inputDate = new Date(played_at);
    if (inputDate > new Date()) {
      return NextResponse.json({ error: "played_at cannot be in the future" }, { status: 400 });
    }

    const { data: existingScores, error: readError } = await supabase
      .from("scores")
      .select("id, played_at")
      .eq("user_id", user_id)
      .order("played_at", { ascending: true });

    if (readError) throw readError;

    if (existingScores.length >= 5) {
      const oldest = existingScores[0];
      const { error: deleteError } = await supabase.from("scores").delete().eq("id", oldest.id);
      if (deleteError) throw deleteError;
    }

    const { data: newScore, error: insertError } = await supabase
      .from("scores")
      .insert({ user_id, score, played_at })
      .single();

    if (insertError) throw insertError;

    const { data: scores, error: returnError } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user_id)
      .order("played_at", { ascending: false });

    if (returnError) throw returnError;

    return NextResponse.json({ score: newScore, scores });
  } catch (error) {
    console.error("/api/scores POST error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
