export const pendingLabs = [
  {
    id: "lab-001",
    patientId: "pat-001",
    patientName: "Elena Ramirez",
    test: "Basic Metabolic Panel",
    priority: "Review today",
    received: "Today, 8:12 AM",
    summary: "Potassium and creatinine require provider review before refill.",
  },
  {
    id: "lab-002",
    patientId: "pat-002",
    patientName: "Marcus Thompson",
    test: "A1C",
    priority: "Routine",
    received: "Yesterday",
    summary: "A1C trend available for diabetes medication review.",
  },
  {
    id: "lab-003",
    patientId: "pat-003",
    patientName: "Ava Patel",
    test: "Respiratory Panel",
    priority: "Patient message pending",
    received: "May 14",
    summary: "Negative panel; send portal follow-up and return precautions.",
  },
] as const;
