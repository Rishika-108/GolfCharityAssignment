import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const { data, error } = await supabase.from("charities").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ charities: data });
  } catch (error) {
    console.error("/api/charities GET error", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, description, image_url, country, is_featured } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const { data, error } = await supabase.from("charities").insert({
      name,
      description,
      image_url,
      country,
      is_featured: Boolean(is_featured),
    }).single();

    if (error) throw error;
    return NextResponse.json({ charity: data }, { status: 201 });
  } catch (error) {
    console.error("/api/charities POST error", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
