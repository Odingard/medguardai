import {
  Activity,
  CalendarCheck,
  ClipboardCheck,
  FileHeart,
  HeartPulse,
  Laptop,
  Stethoscope,
  Users,
} from "lucide-react";

export type IntakeFieldType = "text" | "textarea" | "select" | "checkbox" | "date";

export type IntakeField = {
  id: string;
  label: string;
  type: IntakeFieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  showWhen?: {
    fieldId: string;
    equals: string | boolean;
  };
};

export type IntakeTemplate = {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: typeof FileHeart;
  fields: IntakeField[];
};

export type IntakeFormValues = Record<string, string | boolean>;

const sharedSafetyFields: IntakeField[] = [
  {
    id: "chestPain",
    label: "Chest pain, severe shortness of breath, or neurologic symptoms?",
    type: "select",
    required: true,
    options: ["No", "Yes"],
  },
  {
    id: "urgentDetails",
    label: "Describe urgent symptoms",
    type: "textarea",
    placeholder: "Symptom onset, severity, associated symptoms...",
    showWhen: {
      fieldId: "chestPain",
      equals: "Yes",
    },
  },
];

export const intakeTemplates: IntakeTemplate[] = [
  {
    id: "new-patient",
    title: "New Patient Intake",
    category: "Primary care",
    description:
      "Demographics, history, medications, allergies, and chief concern.",
    icon: Users,
    fields: [
      {
        id: "chiefConcern",
        label: "Chief concern",
        type: "textarea",
        required: true,
        placeholder: "What brings the patient in today?",
      },
      {
        id: "medications",
        label: "Current medications",
        type: "textarea",
        placeholder: "Medication name, dose, frequency...",
      },
      {
        id: "allergies",
        label: "Medication allergies",
        type: "text",
        placeholder: "NKDA or list allergies",
      },
      {
        id: "preferredPharmacy",
        label: "Preferred pharmacy",
        type: "text",
        placeholder: "Pharmacy name and location",
      },
      ...sharedSafetyFields,
    ],
  },
  {
    id: "annual-physical",
    title: "Annual Physical",
    category: "Preventive care",
    description:
      "Preventive screening, immunizations, lifestyle, and wellness updates.",
    icon: CalendarCheck,
    fields: [
      {
        id: "screeningConcerns",
        label: "Preventive screening concerns",
        type: "textarea",
        placeholder: "Colon cancer, mammogram, labs, immunizations...",
      },
      {
        id: "exercise",
        label: "Exercise frequency",
        type: "select",
        options: ["Rarely", "1-2 days/week", "3-4 days/week", "5+ days/week"],
      },
      {
        id: "tobaccoUse",
        label: "Current tobacco use?",
        type: "select",
        options: ["No", "Yes", "Former"],
      },
      {
        id: "needsLabs",
        label: "Patient requests routine labs",
        type: "checkbox",
      },
      ...sharedSafetyFields,
    ],
  },
  {
    id: "telehealth",
    title: "Telehealth Intake",
    category: "Virtual care",
    description:
      "Remote visit symptoms, location confirmation, consent, and follow-up.",
    icon: Laptop,
    fields: [
      {
        id: "patientLocation",
        label: "Patient location during visit",
        type: "text",
        required: true,
        placeholder: "City, state",
      },
      {
        id: "telehealthConsent",
        label: "Telehealth consent confirmed",
        type: "checkbox",
        required: true,
      },
      {
        id: "symptoms",
        label: "Symptoms for today's visit",
        type: "textarea",
        placeholder: "Duration, severity, attempted treatment...",
      },
      ...sharedSafetyFields,
    ],
  },
  {
    id: "diabetes-follow-up",
    title: "Diabetes Follow-up",
    category: "Specialty-specific",
    description:
      "Glucose trends, medications, foot checks, eye exams, and red flags.",
    icon: HeartPulse,
    fields: [
      {
        id: "glucoseTrend",
        label: "Recent glucose trend",
        type: "select",
        required: true,
        options: ["Improving", "Stable", "Worsening", "Not checking"],
      },
      {
        id: "hypoglycemia",
        label: "Any hypoglycemia episodes?",
        type: "select",
        options: ["No", "Yes"],
      },
      {
        id: "hypoglycemiaDetails",
        label: "Hypoglycemia details",
        type: "textarea",
        showWhen: {
          fieldId: "hypoglycemia",
          equals: "Yes",
        },
      },
      {
        id: "footSymptoms",
        label: "Foot numbness, wounds, or pain?",
        type: "text",
        placeholder: "No concerns, or describe symptoms",
      },
      ...sharedSafetyFields,
    ],
  },
  {
    id: "cardiology-intake",
    title: "Cardiology Intake",
    category: "Specialty-specific",
    description:
      "Chest symptoms, BP trends, cardiac history, medication tolerance, and red flags.",
    icon: HeartPulse,
    fields: [
      {
        id: "cardiacSymptoms",
        label: "Chest pain, palpitations, shortness of breath, or edema?",
        type: "textarea",
        placeholder: "Describe timing, exertional pattern, severity, and associated symptoms",
      },
      {
        id: "bloodPressureTrend",
        label: "Recent blood pressure trend",
        type: "select",
        options: ["Controlled", "Elevated", "Low", "Not checking"],
      },
      {
        id: "cardiacMeds",
        label: "Cardiac medications and tolerance",
        type: "textarea",
      },
      ...sharedSafetyFields,
    ],
  },
  {
    id: "orthopedic-intake",
    title: "Orthopedic Intake",
    category: "Specialty-specific",
    description:
      "Pain location, injury mechanism, function limits, imaging, and procedure readiness.",
    icon: Activity,
    fields: [
      {
        id: "painLocation",
        label: "Pain location and duration",
        type: "text",
        required: true,
      },
      {
        id: "injuryMechanism",
        label: "Injury mechanism",
        type: "textarea",
        placeholder: "Fall, sports injury, overuse, post-op, no known injury...",
      },
      {
        id: "functionalLimitations",
        label: "Functional limitations",
        type: "textarea",
      },
      ...sharedSafetyFields,
    ],
  },
  {
    id: "behavioral-health-intake",
    title: "Behavioral Health Intake",
    category: "Specialty-specific",
    description:
      "Mood symptoms, sleep, medication response, therapy goals, and safety screen.",
    icon: Stethoscope,
    fields: [
      {
        id: "moodSymptoms",
        label: "Current mood or anxiety symptoms",
        type: "textarea",
        required: true,
      },
      {
        id: "safetyConcern",
        label: "Any self-harm or safety concern?",
        type: "select",
        options: ["No", "Yes"],
      },
      {
        id: "safetyDetails",
        label: "Safety details",
        type: "textarea",
        showWhen: {
          fieldId: "safetyConcern",
          equals: "Yes",
        },
      },
      ...sharedSafetyFields,
    ],
  },
  {
    id: "hypertension-follow-up",
    title: "Hypertension Follow-up",
    category: "Primary care",
    description:
      "Home BP trends, medication adherence, side effects, lifestyle, and labs.",
    icon: HeartPulse,
    fields: [
      {
        id: "homeBpReadings",
        label: "Recent home BP readings",
        type: "textarea",
        placeholder: "Average readings, highest/lowest, timing...",
      },
      {
        id: "bpMedicationAdherence",
        label: "Taking BP medications as prescribed?",
        type: "select",
        options: ["Yes", "Sometimes missed", "No", "Not sure"],
      },
      {
        id: "bpSideEffects",
        label: "Medication side effects",
        type: "textarea",
        placeholder: "Dizziness, cough, swelling, fatigue...",
      },
      ...sharedSafetyFields,
    ],
  },
  {
    id: "mental-health-screening",
    title: "Mental Health Screening",
    category: "Behavioral health",
    description:
      "PHQ/GAD-style symptom screen, sleep, function, medication response, and safety.",
    icon: Stethoscope,
    fields: [
      {
        id: "moodScore",
        label: "Mood symptoms over the last 2 weeks",
        type: "select",
        options: ["None", "Mild", "Moderate", "Severe"],
      },
      {
        id: "anxietyScore",
        label: "Anxiety symptoms over the last 2 weeks",
        type: "select",
        options: ["None", "Mild", "Moderate", "Severe"],
      },
      {
        id: "functionImpact",
        label: "Impact on work, school, or home life",
        type: "textarea",
      },
      {
        id: "safetyConcern",
        label: "Any self-harm or safety concern?",
        type: "select",
        options: ["No", "Yes"],
      },
      {
        id: "safetyDetails",
        label: "Safety details",
        type: "textarea",
        showWhen: {
          fieldId: "safetyConcern",
          equals: "Yes",
        },
      },
      ...sharedSafetyFields,
    ],
  },
  {
    id: "dermatology-intake",
    title: "Dermatology Intake",
    category: "Specialty-specific",
    description:
      "Rash/lesion details, duration, distribution, triggers, photos, and prior treatments.",
    icon: FileHeart,
    fields: [
      {
        id: "skinConcern",
        label: "Skin concern description",
        type: "textarea",
        required: true,
      },
      {
        id: "skinLocation",
        label: "Location / distribution",
        type: "text",
      },
      {
        id: "skinPhotos",
        label: "Patient has photos available",
        type: "checkbox",
      },
      ...sharedSafetyFields,
    ],
  },
] as const;

export const completedIntakes = [
  {
    id: "intake-401",
    patient: "Elena Ramirez",
    date: "May 16, 2026",
    formType: "Diabetes Follow-up",
    status: "Draft note ready",
  },
  {
    id: "intake-402",
    patient: "Marcus Thompson",
    date: "May 15, 2026",
    formType: "Annual Physical",
    status: "Saved to chart",
  },
  {
    id: "intake-403",
    patient: "Ava Patel",
    date: "May 14, 2026",
    formType: "Telehealth Intake",
    status: "Portal submitted",
  },
] as const;

export const smartIntakeStats = [
  {
    label: "Completed today",
    value: "17",
    icon: ClipboardCheck,
  },
  {
    label: "Draft notes generated",
    value: "12",
    icon: FileHeart,
  },
  {
    label: "Avg intake time saved",
    value: "9 min",
    icon: Activity,
  },
  {
    label: "Provider-ready summaries",
    value: "94%",
    icon: Stethoscope,
  },
] as const;

export function getTemplateDefaults(template: IntakeTemplate): IntakeFormValues {
  return template.fields.reduce<IntakeFormValues>((values, field) => {
    values[field.id] = field.type === "checkbox" ? false : "";
    return values;
  }, {});
}

export function buildSmartTemplate(description: string): IntakeTemplate {
  const lowerDescription = description.toLowerCase();
  const diabetesFocused = lowerDescription.includes("diabet");

  return {
    id: "ai-generated",
    title: diabetesFocused ? "AI Diabetes Intake" : "AI Custom Intake",
    category: "AI Smart Builder",
    description:
      description ||
      "AI-generated form based on a plain-language practice request.",
    icon: FileHeart,
    fields: [
      {
        id: "aiReason",
        label: "Primary visit goal",
        type: "textarea",
        required: true,
        placeholder: "Patient's main goal or concern...",
      },
      {
        id: "symptomDuration",
        label: "Symptom duration",
        type: "select",
        options: ["Today", "1-3 days", "1-2 weeks", "More than 1 month"],
      },
      ...(diabetesFocused
        ? [
            {
              id: "a1cKnown",
              label: "Most recent A1C known?",
              type: "select" as const,
              options: ["No", "Yes"],
            },
            {
              id: "homeGlucose",
              label: "Home glucose readings",
              type: "textarea" as const,
              showWhen: {
                fieldId: "a1cKnown",
                equals: "Yes",
              },
            },
          ]
        : [
            {
              id: "careBarriers",
              label: "Barriers to care",
              type: "textarea" as const,
              placeholder: "Transportation, cost, adherence, access...",
            },
          ]),
      ...sharedSafetyFields,
    ],
  };
}

export function detectRedFlags(values: IntakeFormValues) {
  const flags: string[] = [];
  const serialized = Object.values(values).join(" ").toLowerCase();

  if (values.chestPain === "Yes") {
    flags.push("High-risk symptoms detected — consider urgent note.");
  }

  if (
    serialized.includes("chest pain") ||
    serialized.includes("shortness of breath") ||
    serialized.includes("stroke") ||
    serialized.includes("severe")
  ) {
    flags.push("AI red flag: severe symptom language found in intake.");
  }

  if (values.hypoglycemia === "Yes") {
    flags.push("Diabetes safety flag: hypoglycemia requires provider review.");
  }

  if (values.safetyConcern === "Yes") {
    flags.push("Behavioral health safety flag — provider review before routine workflow.");
  }

  return flags;
}

export function autoFillFromHistory(patientName: string): IntakeFormValues {
  return {
    medications: "Lisinopril 10 mg daily; Metformin 500 mg twice daily",
    allergies: "NKDA",
    preferredPharmacy: "Hill Country Pharmacy",
    chiefConcern: `${patientName} reports stable chronic symptoms and requests routine follow-up.`,
    chestPain: "No",
  };
}

export function generateDraftClinicalNoteLink() {
  return "/dashboard/clinical-notes";
}

export function summarizeIntake(values: IntakeFormValues) {
  const answeredCount = Object.values(values).filter(Boolean).length;
  return `Submitted intake with ${answeredCount} answered fields. Draft Clinical Note is ready for provider review.`;
}
