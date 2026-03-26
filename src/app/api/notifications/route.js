import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { user_id, type, message } = await req.json();
    if (!user_id || !["subscription", "draw_result", "winner"].includes(type) || !message) {
      return NextResponse.json({ error: "user_id, valid type and message required" }, { status: 400 });
    }

    // In production, integrate with email/SMS service (SendGrid, Twilio, etc.)
    const { data, error } = await supabase.from("notifications").insert({
      user_id,
      type,
      status: "sent",
    });

    if (error) throw error;

    // TODO: Send actual email/SMS via provider
    console.log(`[NOTIFICATION] ${type} to ${user_id}: ${message}`);

    return NextResponse.json({ notification: data }, { status: 201 });
  } catch (error) {
    console.error("/api/notifications POST error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const user_id = req.nextUrl.searchParams.get("user_id");
    if (!user_id) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ notifications: data });
  } catch (error) {
    console.error("/api/notifications GET error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
