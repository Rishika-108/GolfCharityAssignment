import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req) {
  try {
    const user_id = req.nextUrl.searchParams.get("user_id");
    if (!user_id) return NextResponse.json({ error: "user_id is required" }, { status: 400 });

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user_id)
      .single();
    if (profileError) throw profileError;

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const { data: charity } = await supabase
      .from("user_charities")
      .select("*, charities(*)")
      .eq("user_id", user_id)
      .single();

    const { data: scores } = await supabase.from("scores").select("*").eq("user_id", user_id).order("played_at", { ascending: false });

    return NextResponse.json({
      profile,
      subscription,
      charity,
      scores: scores || [],
    });
  } catch (error) {
    console.error("/api/user/profile GET error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { user_id, full_name, country } = await req.json();
    if (!user_id) return NextResponse.json({ error: "user_id is required" }, { status: 400 });

    const { data, error } = await supabase
      .from("profiles")
      .update({ ...(full_name && { full_name }), ...(country && { country }) })
      .eq("id", user_id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ profile: data });
  } catch (error) {
    console.error("/api/user/profile PATCH error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
