import { SmartIntakeWorkspace } from "@/components/smart-intake/smart-intake-workspace";

export default function SmartIntakePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
            Smart Intake
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Intake forms that feed directly into clinical workflows.
          </h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Build intelligent forms, preview patient responses in real time,
            detect red flags, and turn completed intake packets into draft
            Clinical Notes.
          </p>
        </div>
      </div>
      <SmartIntakeWorkspace />
    </div>
  );
}
