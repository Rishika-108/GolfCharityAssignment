import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    return NextResponse.json({ session: authData.session, user: authData.user, profile }, { status: 200 });
  } catch (error) {
    console.error("/api/auth/login error", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 401 });
  }
}
