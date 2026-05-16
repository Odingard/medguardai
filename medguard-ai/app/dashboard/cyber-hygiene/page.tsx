import { CyberHygieneDashboard } from "@/components/cyber-hygiene/cyber-hygiene-dashboard";

export default function CyberHygienePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
            Cyber Hygiene
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Agentic security posture for small medical practices.
          </h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Monitor breach exposure, password health, phishing readiness, and
            HIPAA security basics without touching PHI. This is MedGuard
            AI&apos;s differentiating module.
          </p>
        </div>
      </div>
      <CyberHygieneDashboard />
    </div>
  );
}
