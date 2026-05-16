import { PatientDirectory } from "@/components/patients/patient-directory";

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
            Patient Directory
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Shared patient context for the whole MedGuard workspace.
          </h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Keep modules connected by selecting one active patient and moving
            quickly between notes, intake, legal documents, and migration
            review.
          </p>
        </div>
      </div>
      <PatientDirectory />
    </div>
  );
}
