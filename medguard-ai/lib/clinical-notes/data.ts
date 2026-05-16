import {
  ClipboardList,
  FileHeart,
  Laptop,
  Stethoscope,
  Syringe,
} from "lucide-react";

export type NoteMode = "voice" | "text";

export type MockPatient = {
  id: string;
  name: string;
  age: number;
  dob: string;
  reason: string;
  lastVisit: string;
};

export type ClinicalTemplate = {
  id: string;
  title: string;
  description: string;
  icon: typeof FileHeart;
  prompt: string;
};

export type SoapNote = {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  billingCodes: string[];
  icdCodes: string[];
  confidence: {
    subjective: number;
    objective: number;
    assessment: number;
    plan: number;
    billing: number;
    overall: number;
  };
};

export const mockPatients: MockPatient[] = [
  {
    id: "pat-001",
    name: "Elena Ramirez",
    age: 54,
    dob: "02/18/1972",
    reason: "Hypertension follow-up",
    lastVisit: "May 2, 2026",
  },
  {
    id: "pat-002",
    name: "Marcus Thompson",
    age: 42,
    dob: "11/04/1983",
    reason: "Type 2 diabetes medication review",
    lastVisit: "Apr 28, 2026",
  },
  {
    id: "pat-003",
    name: "Ava Patel",
    age: 29,
    dob: "09/12/1996",
    reason: "Telehealth URI follow-up",
    lastVisit: "May 9, 2026",
  },
] as const;

export const clinicalTemplates: ClinicalTemplate[] = [
  {
    id: "follow-up",
    title: "Follow-up Visit",
    description: "Medication review, chronic care, and interval changes.",
    icon: FileHeart,
    prompt: "Follow-up visit with chronic condition monitoring.",
  },
  {
    id: "new-patient",
    title: "New Patient",
    description: "History, exam, assessment, and initial care plan.",
    icon: ClipboardList,
    prompt: "New patient establishment visit with comprehensive history.",
  },
  {
    id: "procedure",
    title: "Procedure Note",
    description: "Indication, consent, procedure, tolerance, and aftercare.",
    icon: Syringe,
    prompt: "Procedure note with risks, consent, and post-procedure plan.",
  },
  {
    id: "telehealth",
    title: "Telehealth",
    description: "Remote visit documentation and follow-up instructions.",
    icon: Laptop,
    prompt: "Telehealth encounter with remote assessment and plan.",
  },
] as const;

export const specialtyTemplates = [
  "Primary Care",
  "Family Medicine",
  "Internal Medicine",
  "Pediatrics",
  "Cardiology",
  "Endocrinology",
  "Behavioral Health",
  "Urgent Care",
] as const;

export const transcriptionSegments = [
  "Patient reports blood pressure has been better controlled at home, averaging around 128 over 78.",
  "She denies chest pain, shortness of breath, dizziness, or medication side effects.",
  "She has been walking three times per week and is trying to reduce sodium intake.",
  "Plan discussed: continue lisinopril, repeat BMP, and follow up in three months.",
] as const;

export const pastNotes = [
  {
    id: "note-1001",
    date: "May 16, 2026",
    patient: "Elena Ramirez",
    type: "Follow-up Visit",
    summary:
      "Hypertension controlled on current therapy; lifestyle progress documented.",
  },
  {
    id: "note-1002",
    date: "May 15, 2026",
    patient: "Marcus Thompson",
    type: "Medication Review",
    summary:
      "Diabetes medication adherence reviewed; metformin continued and labs ordered.",
  },
  {
    id: "note-1003",
    date: "May 14, 2026",
    patient: "Ava Patel",
    type: "Telehealth",
    summary:
      "URI symptoms improving; supportive care and return precautions reviewed.",
  },
] as const;

export function generateMockSoapNote({
  patient,
  template,
  input,
}: {
  patient: MockPatient;
  template: Pick<ClinicalTemplate, "title">;
  input: string;
}): SoapNote {
  const source =
    input.trim() ||
    "Patient reports interval improvement and no acute safety concerns.";

  return {
    subjective: `${patient.name} is a ${patient.age}-year-old patient seen for ${patient.reason.toLowerCase()}. ${source} Patient denies red-flag symptoms and reports adherence to the current care plan.`,
    objective:
      "General: Alert, oriented, and in no acute distress. Vitals reviewed. Cardiopulmonary exam without acute abnormality in this mock example. No focal neurologic deficits noted.",
    assessment: `${template.title}: Stable clinical picture based on provided encounter details. Primary issue remains ${patient.reason.toLowerCase()} with no urgent escalation identified in the simulated note.`,
    plan:
      "Continue current medications unless otherwise noted. Reinforce lifestyle guidance and medication adherence. Order indicated labs or follow-up testing. Return precautions reviewed. Follow up in 3 months or sooner for worsening symptoms.",
    billingCodes: ["99213", "99214", "G2211"],
    icdCodes: ["I10", "Z79.899"],
    confidence: {
      subjective: 88,
      objective: 74,
      assessment: 78,
      plan: 82,
      billing: 68,
      overall: 80,
    },
  };
}

export function buildPlainTextSoap(note: SoapNote) {
  return [
    "SUBJECTIVE",
    note.subjective,
    "",
    "OBJECTIVE",
    note.objective,
    "",
    "ASSESSMENT",
    note.assessment,
    "",
    "PLAN",
    note.plan,
    "",
    `Suggested E/M/CPT codes: ${note.billingCodes.join(", ")}`,
    `Suggested ICD-10 codes: ${note.icdCodes.join(", ")}`,
    `Overall confidence: ${note.confidence.overall}%`,
  ].join("\n");
}

export function mockSaveNoteToPatientRecord(patientName: string) {
  return `Saved mock SOAP note to ${patientName}'s record.`;
}

export function mockCopyToEhr() {
  return "Copied formatted SOAP note to EHR clipboard simulation.";
}

export const clinicalModuleHighlights = [
  {
    label: "Target workflow",
    value: "< 60 sec",
    icon: Stethoscope,
  },
  {
    label: "AI output",
    value: "SOAP + ICD/CPT",
    icon: FileHeart,
  },
] as const;
