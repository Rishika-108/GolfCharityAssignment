import { validateAdminToken, unauthorizedResponse } from "@/lib/adminAuth";
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    if (!validateAdminToken(req)) {
      return unauthorizedResponse();
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
    if (!validateAdminToken(req)) {
      return unauthorizedResponse();
    }
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
