import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";

import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = getStripeWebhookSecret();
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  if (!stripe || !webhookSecret || !signature) {
    return NextResponse.json(
      {
        received: false,
        message:
          "Stripe webhook not configured. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.",
      },
      { status: 200 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      {
        received: false,
        message:
          error instanceof Error
            ? `Webhook signature verification failed: ${error.message}`
            : "Webhook signature verification failed.",
      },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      // Production path: sync plan/customer metadata into Supabase here.
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
