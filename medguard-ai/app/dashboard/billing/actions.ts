"use server";

import { headers } from "next/headers";

import {
  calculatePlanAmount,
  getPlan,
  type PlanId,
} from "@/lib/billing/plans";
import { getStripe } from "@/lib/stripe";

type BillingActionResult = {
  url?: string;
  message?: string;
  customerId?: string;
};

export async function createCheckoutSessionAction({
  planId,
  providerCount,
}: {
  planId: PlanId;
  providerCount: number;
}): Promise<BillingActionResult> {
  const stripe = getStripe();
  const plan = getPlan(planId);
  const headersList = await headers();
  const origin = headersList.get("origin") ?? "http://localhost:3000";

  if (!stripe) {
    return {
      message:
        "Stripe test mode is not configured. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local.",
    };
  }

  const monthlyAmount = calculatePlanAmount(planId, providerCount);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    success_url: `${origin}/dashboard/billing?checkout=success&plan=${plan.id}`,
    cancel_url: `${origin}/dashboard/billing?checkout=cancelled`,
    allow_promotion_codes: true,
    metadata: {
      planId: plan.id,
      providerCount: String(providerCount),
    },
    subscription_data: {
      metadata: {
        planId: plan.id,
        providerCount: String(providerCount),
      },
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: monthlyAmount * 100,
          recurring: {
            interval: "month",
          },
          product_data: {
            name: `MedGuard AI ${plan.name}`,
            description:
              plan.id === "smb"
                ? "$299/month up to 5 providers, then $99/additional provider"
                : `$${plan.monthlyPrice}/month per provider`,
            metadata: {
              lookupKey: plan.stripeLookupKey,
            },
          },
        },
      },
    ],
  });

  return {
    url: session.url ?? undefined,
    customerId:
      typeof session.customer === "string" ? session.customer : undefined,
  };
}

export async function createCustomerPortalAction(): Promise<BillingActionResult> {
  const stripe = getStripe();
  const headersList = await headers();
  const origin = headersList.get("origin") ?? "http://localhost:3000";
  const customerId = headersList.get("x-medguard-stripe-customer");

  if (!stripe) {
    return {
      message:
        "Stripe customer portal is not configured. Add STRIPE_SECRET_KEY to .env.local.",
    };
  }

  if (!customerId) {
    return {
      message:
        "No Stripe customer is linked yet. Start a test checkout before opening the portal.",
    };
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/dashboard/billing`,
  });

  return { url: portal.url };
}
