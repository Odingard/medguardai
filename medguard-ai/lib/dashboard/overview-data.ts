import {
  Chrome,
  ClipboardCheck,
  DatabaseZap,
  FileHeart,
  FileText,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";

import { pastNotes } from "@/lib/clinical-notes/data";
import { cyberRiskScore } from "@/lib/cyber-hygiene/data";
import { migrationHistory } from "@/lib/data-migration/data";
import { legalDocumentHistory } from "@/lib/legal-documents/data";
import { completedIntakes } from "@/lib/smart-intake/data";

export const connectedOverviewStats = [
  {
    label: "Notes created",
    value: String(pastNotes.length + 1),
    helper: "Includes generated SOAP drafts",
    href: "/dashboard/clinical-notes",
    icon: FileHeart,
    featured: false,
  },
  {
    label: "Intakes completed",
    value: String(completedIntakes.length),
    helper: "Ready for note handoff",
    href: "/dashboard/smart-intake",
    icon: ClipboardCheck,
    featured: false,
  },
  {
    label: "Cyber risk score",
    value: String(cyberRiskScore.score),
    helper: cyberRiskScore.trend,
    href: "/dashboard/cyber-hygiene",
    icon: ShieldCheck,
    featured: true,
  },
  {
    label: "Documents generated",
    value: String(legalDocumentHistory.length + 1),
    helper: "Consent and compliance templates",
    href: "/dashboard/legal-documents",
    icon: FileText,
    featured: false,
  },
  {
    label: "Migrations completed",
    value: String(
      migrationHistory.filter((migration) => migration.status === "Completed")
        .length,
    ),
    helper: "Legacy imports tracked",
    href: "/dashboard/data-migration",
    icon: DatabaseZap,
    featured: false,
  },
] as const;

export const dashboardQuickActions = [
  {
    title: "New Note",
    description: "Start ambient dictation or paste encounter details.",
    href: "/dashboard/clinical-notes",
    icon: FileHeart,
    featured: false,
  },
  {
    title: "New Intake",
    description: "Build an intelligent intake packet.",
    href: "/dashboard/smart-intake",
    icon: ClipboardCheck,
    featured: false,
  },
  {
    title: "Run Cyber Scan",
    description: "Refresh practice security posture.",
    href: "/dashboard/cyber-hygiene",
    icon: ShieldCheck,
    featured: true,
  },
  {
    title: "New Document",
    description: "Generate consent or compliance paperwork.",
    href: "/dashboard/legal-documents",
    icon: FileText,
    featured: false,
  },
  {
    title: "Install Chrome Extension",
    description: "Enable EHR Push from supported EHR tabs.",
    href: "/dashboard/billing#chrome-extension",
    icon: Chrome,
    featured: false,
  },
] as const;

export const connectedRecentActivity = [
  {
    title: "Smart Intake packet generated a Clinical Notes handoff",
    detail: "Elena Ramirez intake can prefill a SOAP note draft.",
    time: "6 min ago",
    href: "/dashboard/clinical-notes",
    icon: Sparkles,
    featured: false,
  },
  {
    title: "Cyber Hygiene scan completed",
    detail: `${cyberRiskScore.score}/100 posture score with breach exposure actions remaining.`,
    time: "18 min ago",
    href: "/dashboard/cyber-hygiene",
    icon: ShieldCheck,
    featured: true,
  },
  {
    title: "Telehealth consent sent to patient portal",
    detail: "Legal Documents simulated PDF, signature, and portal delivery.",
    time: "32 min ago",
    href: "/dashboard/legal-documents",
    icon: FileText,
    featured: false,
  },
  {
    title: "Legacy EHR export import completed",
    detail: "Data Migration parsed records and prepared continuity summaries.",
    time: "1 hr ago",
    href: "/dashboard/data-migration",
    icon: UploadCloud,
    featured: false,
  },
] as const;
