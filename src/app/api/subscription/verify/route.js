import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { stripe } from "@/lib/stripeClient";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "session_id required" }, { status: 400 });
    }

    const { user, error: authError, status } = await getUserFromRequest(req);
    if (authError) return NextResponse.json({ error: authError }, { status });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.payment_status === "paid") {
      const subscriptionId = session.metadata?.subscription_id;
      if (subscriptionId) {
        const { data, error: updateError } = await supabase
          .from("subscriptions")
          .update({ 
             status: "active", 
             stripe_subscription_id: session.subscription 
          })
          .eq("id", subscriptionId)
          .select()
          .single();

        if (updateError) throw updateError;
        return NextResponse.json({ status: "active", subscription: data });
      }
    }

    return NextResponse.json({ status: "pending" });
  } catch (error) {
    console.error("/api/subscription/verify error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
