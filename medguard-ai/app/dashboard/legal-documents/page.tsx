import { LegalDocumentsWorkspace } from "@/components/legal-documents/legal-documents-workspace";

export default function LegalDocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
            Legal Documents
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Consent, compliance, and practice documents in seconds.
          </h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Generate patient-ready drafts, tailor clauses with AI, preview and
            edit content, then simulate PDF, signature, and portal workflows.
          </p>
        </div>
      </div>
      <LegalDocumentsWorkspace />
    </div>
  );
}
