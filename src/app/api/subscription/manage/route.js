import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { stripe } from "@/lib/stripeClient";

export async function GET(req) {
  try {
    const user_id = req.nextUrl.searchParams.get("user_id");
    if (!user_id) return NextResponse.json({ error: "user_id is required" }, { status: 400 });

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ subscriptions: data || [] });
  } catch (error) {
    console.error("/api/subscription/list GET error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { subscription_id, action } = await req.json();
    if (!subscription_id || !["cancel", "resume"].includes(action)) {
      return NextResponse.json({ error: "subscription_id and valid action required" }, { status: 400 });
    }

    const { data: sub, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", subscription_id)
      .single();
    if (subError) throw subError;
    if (!sub) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

    const status = action === "cancel" ? "cancelled" : "active";
    const { data, error: updateError } = await supabase
      .from("subscriptions")
      .update({ status })
      .eq("id", subscription_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // TODO: Also update Stripe subscription accordingly
    if (sub.stripe_subscription_id && action === "cancel") {
      try {
        await stripe.subscriptions.cancel(sub.stripe_subscription_id);
      } catch (stripeErr) {
        console.error("Stripe cancel failed:", stripeErr);
      }
    }

    return NextResponse.json({ subscription: data });
  } catch (error) {
    console.error("/api/subscription/manage POST error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
