import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripeClient";
import { supabase } from "@/lib/supabaseClient";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });

  const rawBody = await buffer(req.body);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const subscriptionId = session.metadata?.subscription_id;
      const userId = session.metadata?.user_id;

      if (subscriptionId) {
        await supabase
          .from("subscriptions")
          .update({ status: "active", stripe_subscription_id: session.subscription })
          .eq("id", subscriptionId);
      }

      if (session.amount_total != null && session.currency && userId) {
        const amount = session.amount_total / 100;
        await supabase.from("payments").insert({
          user_id: userId,
          amount,
          currency: session.currency.toUpperCase(),
          status: "success",
          stripe_payment_id: session.payment_intent,
        });

        const { data: userCharity } = await supabase
          .from("user_charities")
          .select("contribution_percentage")
          .eq("user_id", userId)
          .single();

        const percent = (userCharity?.contribution_percentage || 10) / 100;
        const charityAmount = Number((amount * percent).toFixed(2));
        const prizePool = Number((amount * 0.35).toFixed(2));
        const platformFee = Number((amount - charityAmount - prizePool).toFixed(2));

        await supabase.from("subscription_allocations").insert({
          payment_id: session.payment_intent || null,
          prize_pool_amount: prizePool,
          charity_amount: charityAmount,
          platform_fee: platformFee,
        });

        const { data: charityPref } = await supabase
          .from("user_charities")
          .select("charity_id")
          .eq("user_id", userId)
          .single();

        if (charityPref?.charity_id) {
          await supabase.from("charity_transactions").insert({
            user_id: userId,
            charity_id: charityPref.charity_id,
            amount: charityAmount,
            source: "subscription",
          });
        }
      }
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;
      const userId = invoice.customer ? invoice.customer : null;
      if (invoice.subscription) {
        await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", invoice.subscription);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("stripe webhook processing error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
