import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { full_name, email, password, country, charity_id, contribution_percentage, is_admin } = await req.json();

    if (!full_name || !email || !password || !country) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!is_admin && (!charity_id || !contribution_percentage)) {
      return NextResponse.json({ error: "Missing charity required fields" }, { status: 400 });
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    const userId = authData?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "User creation failed" }, { status: 500 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({ id: userId, full_name, email, country, is_admin: is_admin || false })
      .select()
      .single();

    if (profileError) throw profileError;

    let userCharity = null;
    if (!is_admin && charity_id) {
      const { data: uc, error: userCharityError } = await supabase
        .from("user_charities")
        .insert({
          user_id: profile.id,
          charity_id,
          contribution_percentage,
        })
        .select()
        .single();

      if (userCharityError) throw userCharityError;
      userCharity = uc;
    }

    return NextResponse.json({ profile, user_charity: userCharity, session: authData.session }, { status: 201 });
  } catch (error) {
    console.error("/api/register error", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
