import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { stripe } from "@/lib/stripeClient";

function rollingEndDate(startDate, planType) {
  const date = new Date(startDate);
  if (planType === "yearly") {
    date.setUTCFullYear(date.getUTCFullYear() + 1);
  } else {
    date.setUTCDate(date.getUTCDate() + 30);
  }
  return date.toISOString();
}

export async function POST(req) {
  try {
    const { user_id, plan_type } = await req.json();

    if (!user_id || !plan_type || !["monthly", "yearly"].includes(plan_type)) {
      return NextResponse.json({ error: "user_id and valid plan_type are required" }, { status: 400 });
    }

    const priceId =
      plan_type === "yearly"
        ? process.env.STRIPE_YEARLY_PRICE_ID
        : process.env.STRIPE_MONTHLY_PRICE_ID;

    if (!priceId) {
      return NextResponse.json({ error: "Missing Stripe price IDs in env" }, { status: 500 });
    }

    const now = new Date();
    const start_date = now.toISOString();
    const end_date = rollingEndDate(now, plan_type);

    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .insert({
        user_id,
        plan_type,
        status: "pending",
        start_date,
        end_date,
      })
      .single();

    if (subscriptionError) throw subscriptionError;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { subscription_id: subscription.id, user_id },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/cancel`,
    });

    return NextResponse.json({ subscription, checkout_url: session.url }, { status: 201 });
  } catch (error) {
    console.error("/api/subscription/create error", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
