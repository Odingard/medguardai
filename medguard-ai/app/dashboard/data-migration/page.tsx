import { DataMigrationWizard } from "@/components/data-migration/data-migration-wizard";

export default function DataMigrationPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
            Data Migration
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Self-serve legacy patient data import.
          </h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Upload old EHR exports, PDFs, scans, spreadsheets, or CCD files.
            MedGuard AI simulates parsing, mapping, validation, and secure
            import in one guided workflow.
          </p>
        </div>
      </div>
      <DataMigrationWizard />
    </div>
  );
}
