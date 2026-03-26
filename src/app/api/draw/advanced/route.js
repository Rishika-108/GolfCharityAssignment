import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// Advanced draw algorithm: weighted random based on historical performance
export async function POST(req) {
  try {
    const { draw_id, algorithm } = await req.json();
    if (!draw_id || !["weighted", "random"].includes(algorithm)) {
      return NextResponse.json({ error: "draw_id and valid algorithm required" }, { status: 400 });
    }

    const { data: draw } = await supabase.from("draws").select("*").eq("id", draw_id).single();
    if (!draw) return NextResponse.json({ error: "Draw not found" }, { status: 404 });

    let numbers = [];

    if (algorithm === "weighted") {
      // Weighted based on most frequently drawn numbers from past 6 months
      const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: pastDraws } = await supabase
        .from("draws")
        .select("draw_numbers")
        .neq("id", draw_id)
        .gte("published_at", sixMonthsAgo)
        .lte("published_at", draw.published_at || new Date().toISOString());

      const frequency = {};
      (pastDraws || []).forEach((d) => {
        (d.draw_numbers || []).forEach((n) => {
          frequency[n] = (frequency[n] || 0) + 1;
        });
      });

      const sorted = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .map(([n]) => Number(n));

      // Pick top 3 from history, then 2 random
      numbers = [...sorted.slice(0, 3)];
      while (numbers.length < 5) {
        const rand = Math.floor(Math.random() * 45) + 1;
        if (!numbers.includes(rand)) {
          numbers.push(rand);
        }
      }
      numbers = numbers.sort((a, b) => a - b);
    } else {
      // Random as default
      const s = new Set();
      while (s.size < 5) {
        s.add(Math.floor(Math.random() * 45) + 1);
      }
      numbers = Array.from(s).sort((a, b) => a - b);
    }

    return NextResponse.json({ draw_id, algorithm, numbers });
  } catch (error) {
    console.error("/api/draw/advanced error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
