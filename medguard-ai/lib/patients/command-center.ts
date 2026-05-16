import type { MockPatient } from "@/lib/clinical-notes/data";

export type PatientRiskLevel = "Low" | "Medium" | "High";

export type PatientCommandMetrics = {
  notesCount: number;
  intakePending: boolean;
  cyberRisk: PatientRiskLevel;
  cyberScore: number;
  lastActivity: string;
  recentNotes: Array<{
    id: string;
    title: string;
    date: string;
    summary: string;
  }>;
  recentIntakes: Array<{
    id: string;
    title: string;
    status: string;
    date: string;
  }>;
  legalDocuments: Array<{
    id: string;
    title: string;
    status: string;
    date: string;
  }>;
  timeline: Array<{
    id: string;
    module: string;
    title: string;
    detail: string;
    time: string;
  }>;
};

const patientMetrics: Record<string, PatientCommandMetrics> = {
  "pat-001": {
    notesCount: 8,
    intakePending: true,
    cyberRisk: "Medium",
    cyberScore: 78,
    lastActivity: "Today",
    recentNotes: [
      {
        id: "note-elena-1",
        title: "Hypertension follow-up SOAP",
        date: "May 16, 2026",
        summary: "BP controlled on lisinopril; BMP ordered.",
      },
      {
        id: "note-elena-2",
        title: "Medication review",
        date: "May 2, 2026",
        summary: "Reviewed adherence and lifestyle progress.",
      },
    ],
    recentIntakes: [
      {
        id: "intake-elena-1",
        title: "Follow-up intake",
        status: "Pending review",
        date: "Today",
      },
    ],
    legalDocuments: [
      {
        id: "legal-elena-1",
        title: "HIPAA Notice of Privacy Practices",
        status: "Signed",
        date: "May 15, 2026",
      },
    ],
    timeline: [
      {
        id: "timeline-elena-1",
        module: "Clinical Notes",
        title: "SOAP note generated",
        detail: "Draft generated from Smart Intake handoff.",
        time: "12 min ago",
      },
      {
        id: "timeline-elena-2",
        module: "Cyber Hygiene",
        title: "Mailbox exposure reviewed",
        detail: "Risk task created for front desk account.",
        time: "35 min ago",
      },
    ],
  },
  "pat-002": {
    notesCount: 5,
    intakePending: false,
    cyberRisk: "Low",
    cyberScore: 91,
    lastActivity: "Yesterday",
    recentNotes: [
      {
        id: "note-marcus-1",
        title: "Diabetes medication review",
        date: "May 15, 2026",
        summary: "Metformin continued; A1C follow-up planned.",
      },
    ],
    recentIntakes: [
      {
        id: "intake-marcus-1",
        title: "Annual Physical",
        status: "Completed",
        date: "May 15, 2026",
      },
    ],
    legalDocuments: [
      {
        id: "legal-marcus-1",
        title: "Texas Medical Records Release",
        status: "Draft",
        date: "May 14, 2026",
      },
    ],
    timeline: [
      {
        id: "timeline-marcus-1",
        module: "Smart Intake",
        title: "Annual intake completed",
        detail: "Provider-ready summary created.",
        time: "Yesterday",
      },
    ],
  },
  "pat-003": {
    notesCount: 3,
    intakePending: true,
    cyberRisk: "High",
    cyberScore: 62,
    lastActivity: "May 14",
    recentNotes: [
      {
        id: "note-ava-1",
        title: "Telehealth URI follow-up",
        date: "May 14, 2026",
        summary: "Symptoms improving; return precautions reviewed.",
      },
    ],
    recentIntakes: [
      {
        id: "intake-ava-1",
        title: "Telehealth Intake",
        status: "Portal submitted",
        date: "May 14, 2026",
      },
    ],
    legalDocuments: [
      {
        id: "legal-ava-1",
        title: "Telehealth Consent",
        status: "Sent",
        date: "May 16, 2026",
      },
    ],
    timeline: [
      {
        id: "timeline-ava-1",
        module: "Legal Documents",
        title: "Telehealth consent sent",
        detail: "Portal delivery simulated.",
        time: "2 days ago",
      },
      {
        id: "timeline-ava-2",
        module: "Data Migration",
        title: "Legacy notes parsed",
        detail: "Imported continuity summary into patient profile.",
        time: "3 days ago",
      },
    ],
  },
};

export function getPatientCommandMetrics(patient: MockPatient) {
  return (
    patientMetrics[patient.id] ?? {
      notesCount: 0,
      intakePending: false,
      cyberRisk: "Low" as PatientRiskLevel,
      cyberScore: 88,
      lastActivity: patient.lastVisit,
      recentNotes: [],
      recentIntakes: [],
      legalDocuments: [],
      timeline: [
        {
          id: `${patient.id}-created`,
          module: "Patient Directory",
          title: "Patient added",
          detail: `${patient.name} was added to the shared patient context.`,
          time: patient.lastVisit,
        },
      ],
    }
  );
}

export function getRiskBadgeClass(risk: PatientRiskLevel) {
  if (risk === "High") {
    return "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300";
  }

  if (risk === "Medium") {
    return "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300";
  }

  return "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300";
}
