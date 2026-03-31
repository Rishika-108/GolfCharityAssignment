import { createClient } from "@supabase/supabase-js";
import { validateAdminToken, unauthorizedResponse } from "@/lib/adminAuth";
import { getUserFromRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    const { data, error } = await adminSupabase.from("charities").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ charities: data || [] });
  } catch (error) {
    console.error("/api/charities GET error", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    if (!validateAdminToken(req)) {
      const { profile, error: authError, status } = await getUserFromRequest(req);
      if (authError || !profile?.is_admin) {
        return unauthorizedResponse();
      }
    }

    const { name, description, image_url, country, is_featured } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const { data, error } = await adminSupabase.from("charities").insert({
      name,
      description,
      image_url,
      country,
      is_featured: Boolean(is_featured),
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ charity: data }, { status: 201 });
  } catch (error) {
    console.error("/api/charities POST error", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
