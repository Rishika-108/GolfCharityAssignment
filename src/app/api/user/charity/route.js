import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req) {
  try {
    const { user, profile, error, status } = await getUserFromRequest(req);
    if (error) return NextResponse.json({ error }, { status });

    const user_id = user.id;
    const { charity_id, contribution_percentage } = await req.json();

    if (!charity_id || contribution_percentage === undefined) {
      return NextResponse.json({ error: "charity_id and contribution_percentage are required" }, { status: 400 });
    }

    if (contribution_percentage < 10) {
      return NextResponse.json({ error: "Contribution percentage must be at least 10" }, { status: 400 });
    }

    // Check if user already has a charity selected
    const { data: existingCharity } = await supabase
      .from("user_charities")
      .select("id")
      .eq("user_id", user_id)
      .single();

    let result;
    if (existingCharity) {
      // Update existing
      const { data, error: updateError } = await supabase
        .from("user_charities")
        .update({ charity_id, contribution_percentage })
        .eq("id", existingCharity.id)
        .select("*, charities(*)")
        .single();
      if (updateError) throw updateError;
      result = data;
    } else {
      // Insert new
      const { data, error: insertError } = await supabase
        .from("user_charities")
        .insert({ user_id, charity_id, contribution_percentage })
        .select("*, charities(*)")
        .single();
      if (insertError) throw insertError;
      result = data;
    }

    return NextResponse.json({ charity: result });
  } catch (error) {
    console.error("/api/user/charity POST error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
