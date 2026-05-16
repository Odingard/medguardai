import {
  FileCheck2,
  FileHeart,
  FileText,
  Gavel,
  HeartHandshake,
  Shield,
  Signature,
} from "lucide-react";

import type { MockPatient } from "@/lib/clinical-notes/data";
import { legalDocumentPrompt } from "@/lib/ai-prompts";

export type LegalDocumentStatus = "Draft" | "Signed" | "Sent" | "Archived";

export type LegalDocumentTemplate = {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: typeof FileText;
  defaultClauses: string[];
};

export type GeneratedLegalDocument = {
  title: string;
  patientName: string;
  effectiveDate: string;
  body: string;
  customClauses: string;
  status: LegalDocumentStatus;
};

export const legalDocumentTemplates: LegalDocumentTemplate[] = [
  {
    id: "hipaa-notice",
    title: "HIPAA Notice of Privacy Practices",
    category: "Compliance",
    description:
      "Template notice describing how protected health information may be used and disclosed.",
    icon: Shield,
    defaultClauses: [
      "How medical information may be used for treatment, payment, and healthcare operations.",
      "Patient rights to access, amend, and request restrictions on protected health information.",
      "Practice duties to safeguard records and notify patients when required by law.",
    ],
  },
  {
    id: "telehealth-consent",
    title: "Telehealth Consent",
    category: "Care delivery",
    description:
      "Consent language for virtual visits, technology limitations, and emergency instructions.",
    icon: HeartHandshake,
    defaultClauses: [
      "Patient consents to receive care through audio/video technology when clinically appropriate.",
      "Patient understands telehealth has technology and privacy limitations.",
      "Patient agrees to seek emergency care for urgent or life-threatening symptoms.",
    ],
  },
  {
    id: "treatment-consent",
    title: "General Treatment Consent",
    category: "Patient intake",
    description:
      "General consent for evaluation, treatment, routine procedures, and care coordination.",
    icon: FileHeart,
    defaultClauses: [
      "Patient authorizes evaluation, examination, and medically necessary treatment.",
      "Patient understands no specific outcome is guaranteed.",
      "Patient authorizes care coordination with relevant healthcare professionals.",
    ],
  },
  {
    id: "baa-nda",
    title: "NDA / Business Associate Agreement",
    category: "Vendor management",
    description:
      "Business associate and confidentiality template for vendors handling sensitive practice data.",
    icon: Gavel,
    defaultClauses: [
      "Recipient agrees to protect confidential and regulated information.",
      "Recipient will report suspected unauthorized disclosure promptly.",
      "Recipient will return or destroy confidential information at termination when feasible.",
    ],
  },
  {
    id: "texas-records-release",
    title: "Texas Medical Records Release",
    category: "Texas-specific",
    description:
      "Authorization template for release of medical records under Texas practice workflows.",
    icon: FileCheck2,
    defaultClauses: [
      "Patient authorizes release of specified medical records to the named recipient.",
      "Authorization may be revoked in writing except where action has already been taken.",
      "Records release scope, recipient, and expiration should be completed before use.",
    ],
  },
  {
    id: "custom-document",
    title: "Custom Document",
    category: "AI-generated",
    description:
      "Start from a blank legal-medical template and tailor clauses for the practice workflow.",
    icon: Signature,
    defaultClauses: [
      "Custom terms should be reviewed by qualified legal counsel before final use.",
      "Practice-specific details, state requirements, and patient context should be verified.",
    ],
  },
  {
    id: "texas-minor-consent",
    title: "Texas Minor Consent / Guardian Authorization",
    category: "Texas-specific",
    description:
      "Guardian authorization template for minor treatment workflows and responsible party acknowledgement.",
    icon: FileCheck2,
    defaultClauses: [
      "Guardian or responsible party authorizes evaluation and treatment for the named minor.",
      "Practice should verify identity, custody/authority, and emergency contact information.",
      "Legal counsel should review state-specific requirements before use.",
    ],
  },
  {
    id: "financial-responsibility",
    title: "Financial Responsibility Agreement",
    category: "Practice operations",
    description:
      "Patient acknowledgement for payment responsibility, insurance assignment, and billing policies.",
    icon: FileText,
    defaultClauses: [
      "Patient acknowledges responsibility for charges not covered by insurance.",
      "Patient authorizes insurance assignment and billing communication when applicable.",
      "Practice policies for cancellations, copays, and balances should be completed before use.",
    ],
  },
  {
    id: "roi-telehealth-photo-release",
    title: "Telehealth + Photo Permission Addendum",
    category: "Care delivery",
    description:
      "Addendum for telehealth care, patient-submitted images, and photography permission workflows.",
    icon: HeartHandshake,
    defaultClauses: [
      "Patient consents to telehealth evaluation when clinically appropriate.",
      "Patient authorizes use of submitted images for care documentation as specified.",
      "Patient understands image quality and remote care limitations may require in-person evaluation.",
    ],
  },
] as const;

export const legalDocumentHistory = [
  {
    id: "doc-701",
    documentType: "Telehealth Consent",
    patient: "Ava Patel",
    dateCreated: "May 16, 2026",
    status: "Sent" as LegalDocumentStatus,
  },
  {
    id: "doc-702",
    documentType: "HIPAA Notice of Privacy Practices",
    patient: "Elena Ramirez",
    dateCreated: "May 15, 2026",
    status: "Signed" as LegalDocumentStatus,
  },
  {
    id: "doc-703",
    documentType: "Texas Medical Records Release",
    patient: "Marcus Thompson",
    dateCreated: "May 14, 2026",
    status: "Draft" as LegalDocumentStatus,
  },
  {
    id: "doc-704",
    documentType: "Business Associate Agreement",
    patient: "Practice vendor",
    dateCreated: "May 10, 2026",
    status: "Archived" as LegalDocumentStatus,
  },
] as const;

export const legalModuleStats = [
  {
    label: "Docs generated this week",
    value: "28",
    icon: FileText,
  },
  {
    label: "Awaiting signature",
    value: "6",
    icon: Signature,
  },
  {
    label: "Texas forms ready",
    value: "4",
    icon: FileCheck2,
  },
] as const;

function formatClauses(clauses: string[]) {
  return clauses.map((clause, index) => `${index + 1}. ${clause}`).join("\n");
}

export function generateLegalDocument({
  template,
  patient,
  customPrompt,
}: {
  template: LegalDocumentTemplate;
  patient: MockPatient;
  customPrompt?: string;
}): GeneratedLegalDocument {
  const effectiveDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const customLanguage = customPrompt?.trim()
    ? `\n\nCUSTOM REQUEST\n${customPrompt.trim()}`
    : "";

  return {
    title: template.title,
    patientName: patient.name,
    effectiveDate,
    customClauses: customPrompt?.trim() ?? "",
    status: "Draft",
    body: [
      `${template.title.toUpperCase()}`,
      "",
      `Patient / Party: ${patient.name}`,
      `Effective Date: ${effectiveDate}`,
      "",
      "PURPOSE",
      `This document is a MedGuard AI-generated template for ${template.description.toLowerCase()}`,
      "",
      "KEY TERMS",
      formatClauses(template.defaultClauses),
      customLanguage,
      "",
      "ACKNOWLEDGMENT",
      "By signing, the patient or authorized party acknowledges receipt, review, and understanding of the template terms above.",
      "",
      "LEGAL REVIEW NOTICE",
      "This document is a template only and should be reviewed by qualified legal counsel before final use.",
    ].join("\n"),
  };
}

export function buildCustomLegalTemplate(prompt: string): LegalDocumentTemplate {
  const telehealthFocused = prompt.toLowerCase().includes("telehealth");

  return {
    id: "ai-custom-legal",
    title: telehealthFocused
      ? "AI Telehealth Consent Addendum"
      : "AI Custom Practice Document",
    category: "AI Custom Builder",
    description:
      prompt ||
      "AI-generated legal-medical document tailored to the practice request.",
    icon: Signature,
    defaultClauses: [
      legalDocumentPrompt,
      "Parties acknowledge the document is generated from practice-provided instructions.",
      telehealthFocused
        ? "Patient consents to telehealth care, remote communication, and documented media permissions as specified."
        : "Custom clauses should be checked against practice policy and state-specific requirements.",
      "Final document must be reviewed before patient or vendor execution.",
    ],
  };
}

export function mockGeneratePdf(documentTitle: string) {
  return `Generated mock PDF for ${documentTitle}. Real PDF generation can connect to @react-pdf/renderer or jsPDF.`;
}

export function mockSignDigitally(patientName: string) {
  return `Digital signature simulation complete for ${patientName}.`;
}

export function mockSendDocument(patientName: string) {
  return `Sent mock document packet to ${patientName}'s patient portal.`;
}
