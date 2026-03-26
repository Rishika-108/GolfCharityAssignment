import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { full_name, email, country, charity_id, contribution_percentage } = await req.json();

    if (!full_name || !email || !country || !charity_id || !contribution_percentage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: existing, error: existingError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({ full_name, email, country })
      .single();

    if (profileError) throw profileError;

    const { data: userCharity, error: userCharityError } = await supabase
      .from("user_charities")
      .insert({
        user_id: profile.id,
        charity_id,
        contribution_percentage,
      })
      .single();

    if (userCharityError) throw userCharityError;

    return NextResponse.json({ profile, user_charity: userCharity }, { status: 201 });
  } catch (error) {
    console.error("/api/register error", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
