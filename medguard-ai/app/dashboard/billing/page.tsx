import { BillingDashboard } from "@/components/billing/billing-dashboard";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
            Billing
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Subscription tiers and feature access.
          </h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Test Stripe Checkout, manage subscription state, and preview
            tier-based feature gating for Solo, Premium, and SMB practices.
          </p>
        </div>
      </div>
      <BillingDashboard />
    </div>
  );
}
