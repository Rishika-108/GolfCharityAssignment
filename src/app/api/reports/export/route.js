import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function convertToCSV(headers, rows) {
  const csvHeaders = headers.join(",");
  const csvRows = rows.map((row) => headers.map((h) => JSON.stringify(row[h] || "")).join(","));
  return [csvHeaders, ...csvRows].join("\n");
}

export async function GET(req) {
  try {
    const format = req.nextUrl.searchParams.get("format") || "json";
    const report = req.nextUrl.searchParams.get("report") || "winners";

    if (!["json", "csv"].includes(format)) {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    let data = [];

    if (report === "winners") {
      const { data: winners } = await supabase
        .from("winners")
        .select("id,user_id,match_type,prize_amount,status,created_at")
        .order("created_at", { ascending: false });
      data = winners || [];
    } else if (report === "charities") {
      const { data: charities } = await supabase
        .from("charity_transactions")
        .select("user_id,charity_id,amount,source,created_at")
        .order("created_at", { ascending: false });
      data = charities || [];
    } else if (report === "subscriptions") {
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("id,user_id,plan_type,status,start_date,end_date,created_at")
        .order("created_at", { ascending: false });
      data = subs || [];
    } else if (report === "draws") {
      const { data: draws } = await supabase
        .from("draws")
        .select("id,month,year,status,draw_numbers,published_at")
        .order("published_at", { ascending: false });
      data = draws || [];
    } else {
      return NextResponse.json({ error: "Invalid report name" }, { status: 400 });
    }

    if (format === "csv") {
      const headers = data.length > 0 ? Object.keys(data[0]) : [];
      const csv = convertToCSV(headers, data);
      return new NextResponse(csv, {
        headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="${report}.csv"` },
      });
    }

    return NextResponse.json({ report, data });
  } catch (error) {
    console.error("/api/reports/export GET error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
