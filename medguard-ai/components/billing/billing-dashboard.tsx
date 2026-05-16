"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, CreditCard, ExternalLink } from "lucide-react";

import {
  createCheckoutSessionAction,
  createCustomerPortalAction,
} from "@/app/dashboard/billing/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  billingUsageStats,
  featureLabels,
  getPlan,
  subscriptionPlans,
  type PlanId,
} from "@/lib/billing/plans";
import { useSubscriptionStore } from "@/lib/stores/subscriptionStore";
import { cn } from "@/lib/utils";

export function BillingDashboard() {
  const {
    currentPlanId,
    providerCount,
    stripeCustomerId,
    setCurrentPlan,
    setProviderCount,
    setStripeCustomerId,
  } = useSubscriptionStore();
  const [statusMessage, setStatusMessage] = useState(
    "Stripe is in test mode until production keys and webhook syncing are configured.",
  );
  const [isLoadingPlan, setIsLoadingPlan] = useState<PlanId | null>(null);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const currentPlan = getPlan(currentPlanId);

  async function handleCheckout(planId: PlanId) {
    setIsLoadingPlan(planId);
    setStatusMessage("Creating Stripe Checkout session...");

    try {
      const result = await createCheckoutSessionAction({
        planId,
        providerCount,
      });

      setCurrentPlan(planId);

      if (result.customerId) {
        setStripeCustomerId(result.customerId);
      }

      if (result.url) {
        window.location.href = result.url;
        return;
      }

      setStatusMessage(
        result.message ??
          `Test mode: ${getPlan(planId).name} selected locally for feature gating.`,
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Unable to start Stripe Checkout.",
      );
    } finally {
      setIsLoadingPlan(null);
    }
  }

  async function handlePortal() {
    setIsPortalLoading(true);
    setStatusMessage("Opening Stripe Customer Portal...");

    try {
      const result = await createCustomerPortalAction();

      if (result.url) {
        window.location.href = result.url;
        return;
      }

      setStatusMessage(
        result.message ??
          "Customer Portal requires a Stripe customer from a completed checkout.",
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Unable to open Stripe Customer Portal.",
      );
    } finally {
      setIsPortalLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Alert variant="warning">
        <AlertTriangle className="size-4" />
        <AlertTitle>Stripe test mode</AlertTitle>
        <AlertDescription>
          Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and
          `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `.env.local`, then test with
          card `4242 4242 4242 4242`.
        </AlertDescription>
      </Alert>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <Card className="border-primary/20 bg-[linear-gradient(135deg,_hsl(var(--card)),_hsl(var(--secondary)))]">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="success">Current plan</Badge>
              <Badge variant="outline">{currentPlan.name}</Badge>
            </div>
            <CardTitle className="text-3xl">
              Billing and subscriptions for SMB-ready MedGuard AI.
            </CardTitle>
            <CardDescription className="max-w-3xl text-base leading-7">
              Start on Pro, unlock advanced AI/cyber/migration capabilities on
              Premium, and move groups to SMB for team features, analytics, and
              admin workflows.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {billingUsageStats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div key={stat.label} className="rounded-xl border bg-card/80 p-4">
                  <Icon className="size-5 text-primary" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stat.helper}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage subscription</CardTitle>
            <CardDescription>
              Use Stripe Checkout for upgrades and the Customer Portal for plan
              management after checkout.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider-count">Provider count</Label>
              <Input
                id="provider-count"
                type="number"
                min={1}
                value={providerCount}
                onChange={(event) =>
                  setProviderCount(Number(event.target.value || 1))
                }
              />
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handlePortal}
              disabled={isPortalLoading}
            >
              <CreditCard />
              Manage Subscription
              <ExternalLink />
            </Button>
            <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
              {statusMessage}
            </p>
            {stripeCustomerId ? (
              <p className="text-xs text-muted-foreground">
                Linked Stripe customer: {stripeCustomerId}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {subscriptionPlans.map((plan) => {
          const Icon = plan.icon;
          const selected = plan.id === currentPlanId;
          const loading = isLoadingPlan === plan.id;

          return (
            <Card
              key={plan.id}
              className={cn(
                "flex flex-col",
                selected && "border-primary bg-secondary/50",
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  {selected ? <Badge variant="success">Active</Badge> : null}
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.tagline}</CardDescription>
                <div>
                  <span className="text-4xl font-semibold">
                    ${plan.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground">/mo</span>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {plan.id === "smb"
                      ? "Up to 5 providers, then $99/additional"
                      : "Per provider"}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-5">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      {featureLabels[feature]}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={selected ? "outline" : "default"}
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading}
                >
                  {loading ? "Starting checkout..." : selected ? "Current plan" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
