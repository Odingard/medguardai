import { ClinicalNotesWorkspace } from "@/components/clinical-notes/clinical-notes-workspace";

export default function ClinicalNotesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
            Clinical Notes
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            AI-assisted notes built for fast provider review.
          </h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Capture ambient-style dictation, paste or upload context, generate
            editable SOAP notes, and prepare E/M billing suggestions for the
            chart in under a minute.
          </p>
        </div>
      </div>
      <ClinicalNotesWorkspace />
    </div>
  );
}
