import "server-only";

import Stripe from "stripe";

export function getStripe() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return null;
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: "2026-04-22.dahlia",
    appInfo: {
      name: "MedGuard AI",
      version: "0.1.0",
    },
  });
}

export function getStripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET;
}

export function getStripePublishableKey() {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
}
