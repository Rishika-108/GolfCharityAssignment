import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { stripe } from "@/lib/stripeClient";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req) {
  try {
    const { user, error, status } = await getUserFromRequest(req);
    if (error) return NextResponse.json({ error }, { status });

    const user_id = user.id;

    const { data: subscriptions, error: fetchError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (fetchError) throw fetchError;
    return NextResponse.json({ subscriptions: subscriptions || [] });
  } catch (error) {
    console.error("/api/subscription/manage GET error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { user, error: authError, status: authStatus } = await getUserFromRequest(req);
    if (authError) return NextResponse.json({ error: authError }, { status: authStatus });

    const user_id = user.id;
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
    
    // IDOR protection
    if (sub.user_id !== user_id) {
      return NextResponse.json({ error: "Unauthorized access to subscription" }, { status: 403 });
    }

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
