import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req) {
  try {
    const { user, profile, error, status } = await getUserFromRequest(req);
    if (error) return NextResponse.json({ error }, { status });

    const user_id = user.id;

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
    
    const { data: winners } = await supabase.from("winners").select("*").eq("user_id", user_id);

    return NextResponse.json({
      profile,
      subscription,
      charity,
      scores: scores || [],
      winners: winners || [],
    });
  } catch (error) {
    console.error("/api/user/profile GET error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { user, error, status } = await getUserFromRequest(req);
    if (error) return NextResponse.json({ error }, { status });

    const user_id = user.id;
    const { full_name, country } = await req.json();

    const { data, error: updateError } = await supabase
      .from("profiles")
      .update({ ...(full_name && { full_name }), ...(country && { country }) })
      .eq("id", user_id)
      .select()
      .single();

    if (updateError) throw updateError;
    return NextResponse.json({ profile: data });
  } catch (error) {
    console.error("/api/user/profile PATCH error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
