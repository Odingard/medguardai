import { DashboardOverview } from "@/components/dashboard/overview";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
          Overview
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Good morning. Your practice is ready for review.
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Monitor documentation throughput, intake progress, legal workflows,
          migration status, and the Cyber Hygiene risk posture that differentiates
          MedGuard AI.
        </p>
      </div>
      <DashboardOverview />
    </div>
  );
}
