import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { admin_id, action, entity_type, entity_id } = await req.json();
    if (!admin_id || !action || !entity_type) {
      return NextResponse.json({ error: "admin_id, action, and entity_type are required" }, { status: 400 });
    }

    const { data, error } = await supabase.from("admin_logs").insert({
      admin_id,
      action,
      entity_type,
      entity_id: entity_id || null,
    });

    if (error) throw error;
    return NextResponse.json({ log: data }, { status: 201 });
  } catch (error) {
    console.error("/api/admin/logs POST error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
    const { data, error } = await supabase
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return NextResponse.json({ logs: data });
  } catch (error) {
    console.error("/api/admin/logs GET error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
