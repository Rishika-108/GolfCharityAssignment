import { createClient } from "@supabase/supabase-js";
import { validateAdminToken, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  try {
    if (!validateAdminToken(req)) {
      return unauthorizedResponse();
    }
    const { data, error } = await adminSupabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ users: data || [] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    if (!validateAdminToken(req)) {
      return unauthorizedResponse();
    }
    const { userId, is_admin } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

    const { error } = await adminSupabase.from("profiles").update({ is_admin }).eq("id", userId);
    if (error) throw error;

    // LOG
    await adminSupabase.from("admin_logs").insert({
       action: `user_update_status`,
       entity_type: "user",
       entity_id: userId,
       admin_id: "ADMIN"
    });

    return NextResponse.json({ message: "User updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    if (!validateAdminToken(req)) {
      return unauthorizedResponse();
    }
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");
    if (!userId) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const { error } = await adminSupabase.from("profiles").delete().eq("id", userId);
    if (error) throw error;

    // LOG
    await adminSupabase.from("admin_logs").insert({
       action: `user_delete`,
       entity_type: "user",
       entity_id: userId,
       admin_id: "ADMIN"
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
