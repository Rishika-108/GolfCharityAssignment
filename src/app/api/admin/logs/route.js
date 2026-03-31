import { validateAdminToken, unauthorizedResponse } from "@/lib/adminAuth";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    if (!validateAdminToken(req)) {
      return unauthorizedResponse();
    }

    const { admin_id, action, entity_type, entity_id } = await req.json();
    if (!action || !entity_type) {
      return NextResponse.json({ error: "action and entity_type are required" }, { status: 400 });
    }

    const { data, error } = await adminSupabase.from("admin_logs").insert({
      admin_id: admin_id || "SYSTEM",
      action,
      entity_type,
      entity_id: entity_id || null,
    });

    if (error) throw error;
    return NextResponse.json({ success: true, log: data }, { status: 201 });
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
    const { data, error } = await adminSupabase
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
