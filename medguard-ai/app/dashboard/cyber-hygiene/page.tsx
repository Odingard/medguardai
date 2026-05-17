import { CyberHygieneDashboard } from "@/components/cyber-hygiene/cyber-hygiene-dashboard";
import { getDashboardUser } from "@/lib/auth/session";

export default async function CyberHygienePage() {
  const user = await getDashboardUser();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Cyber Hygiene
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {user.role === "admin"
            ? "Practice security posture"
            : "Your security checklist"}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {user.role === "admin"
            ? "Monitor breach exposure and HIPAA compliance across the practice. Only account administrators can see this full view."
            : "Action items that need your attention. Practice-wide security posture is managed by your admin."}
        </p>
      </div>
      <CyberHygieneDashboard role={user.role} userEmail={user.email} />
    </div>
  );
}
