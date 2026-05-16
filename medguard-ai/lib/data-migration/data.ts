import {
  AlertTriangle,
  CheckCircle2,
  DatabaseZap,
  FileArchive,
  FileImage,
  FileSearch,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";

export type MigrationStep = "welcome" | "analysis" | "mapping" | "options" | "results";
export type MigrationIssueSeverity = "high" | "medium" | "low";

export type ParsedPatientRecord = {
  id: string;
  patientName: string;
  dob: string;
  lastVisit: string;
  notesSummary: string;
  source: string;
  confidence: number;
};

export type MigrationIssue = {
  id: string;
  severity: MigrationIssueSeverity;
  description: string;
  suggestedAction: string;
};

export type FieldMapping = {
  sourceField: string;
  suggestedTarget: string;
  confidence: number;
};

export type ImportOption = {
  id: string;
  label: string;
  description: string;
  defaultSelected: boolean;
};

export const supportedFormats = [
  {
    label: "PDF",
    description: "Scanned charts, referral packets, and exported documents",
    icon: FileText,
  },
  {
    label: "Excel (.xlsx)",
    description: "Legacy spreadsheets and billing-system exports",
    icon: FileSpreadsheet,
  },
  {
    label: "CSV",
    description: "Structured patient demographics and medication lists",
    icon: FileArchive,
  },
  {
    label: "Images",
    description: "JPG or PNG scans of paper records",
    icon: FileImage,
  },
  {
    label: "CCD/CCDA",
    description: "Basic continuity-of-care exports",
    icon: DatabaseZap,
  },
] as const;

export const sampleDetectedRecords: ParsedPatientRecord[] = [
  {
    id: "parsed-001",
    patientName: "Elena Ramirez",
    dob: "02/18/1972",
    lastVisit: "05/02/2026",
    notesSummary:
      "Hypertension follow-up, controlled on lisinopril, BMP ordered.",
    source: "ridgeway-export.pdf",
    confidence: 96,
  },
  {
    id: "parsed-002",
    patientName: "Marcus Thompson",
    dob: "11/04/1983",
    lastVisit: "04/28/2026",
    notesSummary:
      "Type 2 diabetes review, metformin continued, A1C follow-up planned.",
    source: "patient-roster.xlsx",
    confidence: 92,
  },
  {
    id: "parsed-003",
    patientName: "Ava Patel",
    dob: "09/12/1996",
    lastVisit: "05/09/2026",
    notesSummary:
      "Telehealth URI follow-up, supportive care and return precautions.",
    source: "scanned-notes.zip",
    confidence: 88,
  },
] as const;

export const sampleFieldMappings: FieldMapping[] = [
  {
    sourceField: "Patient Full Name",
    suggestedTarget: "patient.name",
    confidence: 98,
  },
  {
    sourceField: "DOB",
    suggestedTarget: "patient.dateOfBirth",
    confidence: 97,
  },
  {
    sourceField: "Last Encounter",
    suggestedTarget: "encounter.lastVisitDate",
    confidence: 91,
  },
  {
    sourceField: "Problem List",
    suggestedTarget: "clinical.history.conditions",
    confidence: 86,
  },
  {
    sourceField: "Medication Notes",
    suggestedTarget: "clinical.medications",
    confidence: 82,
  },
] as const;

export const sampleMigrationIssues: MigrationIssue[] = [
  {
    id: "issue-001",
    severity: "medium",
    description: "Possible duplicate patient: Elena Ramirez appears in two source files.",
    suggestedAction: "Review duplicate before secure import.",
  },
  {
    id: "issue-002",
    severity: "low",
    description: "Ava Patel record is missing preferred pharmacy.",
    suggestedAction: "Import demographics now and complete pharmacy later.",
  },
  {
    id: "issue-003",
    severity: "high",
    description: "One scanned PDF has low OCR confidence for medication names.",
    suggestedAction: "Require manual review before importing medications.",
  },
] as const;

export const importOptions: ImportOption[] = [
  {
    id: "demographics",
    label: "Patient Demographics",
    description: "Names, DOB, contact details, and identifiers",
    defaultSelected: true,
  },
  {
    id: "history",
    label: "History Notes",
    description: "Past visit summaries and problem-list context",
    defaultSelected: true,
  },
  {
    id: "medications",
    label: "Medications",
    description: "Medication names, doses, and legacy notes",
    defaultSelected: true,
  },
  {
    id: "allergies",
    label: "Allergies",
    description: "Medication and environmental allergies",
    defaultSelected: true,
  },
  {
    id: "documents",
    label: "Legacy Documents",
    description: "Original PDFs, images, and export files for audit trail",
    defaultSelected: false,
  },
] as const;

export const migrationHistory = [
  {
    id: "migration-1001",
    date: "May 16, 2026",
    source: "Legacy EHR PDF export",
    imported: "128 patients",
    status: "Completed",
  },
  {
    id: "migration-1002",
    date: "May 12, 2026",
    source: "Patient roster CSV",
    imported: "43 patients",
    status: "Dry run",
  },
  {
    id: "migration-1003",
    date: "May 8, 2026",
    source: "Scanned chart batch",
    imported: "19 documents",
    status: "Review needed",
  },
] as const;

export const migrationStats = [
  {
    label: "Patients found",
    value: "128",
    icon: CheckCircle2,
  },
  {
    label: "Documents parsed",
    value: "342",
    icon: FileSearch,
  },
  {
    label: "Records ready",
    value: "119",
    icon: DatabaseZap,
  },
  {
    label: "Issues flagged",
    value: "9",
    icon: AlertTriangle,
  },
] as const;

export const processingStages = [
  "Uploading encrypted files",
  "Running OCR and document understanding",
  "Extracting patient records",
  "Suggesting field mappings",
  "Preparing secure import plan",
] as const;

export function simulateFileAnalysis(fileCount: number) {
  return {
    patientsFound: Math.max(3, fileCount * 24),
    documentsFound: Math.max(8, fileCount * 61),
    recordsReady: Math.max(3, fileCount * 22),
    summary:
      "AI analysis identified demographics, notes, medications, allergies, and source documents for review.",
  };
}

export function simulateSecureImport({
  dryRun,
  selectedOptionCount,
}: {
  dryRun: boolean;
  selectedOptionCount: number;
}) {
  return {
    title: dryRun ? "Dry run complete" : "Secure import complete",
    summary: dryRun
      ? "No records were written. The migration plan is ready for final review."
      : "Selected records were imported into the mock MedGuard patient workspace.",
    importedPatients: dryRun ? 0 : 119,
    importedDocuments: dryRun ? 0 : 342,
    selectedOptionCount,
  };
}

export function mockDownloadReport() {
  return "Downloaded mock migration report with parsed records, mappings, issues, and import summary.";
}

export const securityAssurances = [
  {
    title: "End-to-end encryption",
    description: "Files are treated as encrypted in transit and at rest in this MVP flow.",
    icon: ShieldCheck,
  },
  {
    title: "HIPAA-ready architecture",
    description: "Designed for auditable import steps, review checkpoints, and least-privilege processing.",
    icon: UploadCloud,
  },
] as const;
