import {
  Activity,
  ClipboardCheck,
  Clock3,
  FileHeart,
  ShieldCheck,
} from "lucide-react";

export const overviewStats = [
  {
    label: "Notes generated today",
    value: "18",
    helper: "+24% vs. yesterday",
    icon: FileHeart,
    featured: false,
  },
  {
    label: "Intake forms completed",
    value: "42",
    helper: "8 awaiting review",
    icon: ClipboardCheck,
    featured: false,
  },
  {
    label: "Cyber risk score",
    value: "84",
    helper: "Low risk - 3 actions left",
    icon: ShieldCheck,
    featured: true,
  },
  {
    label: "Hours saved this week",
    value: "31.5",
    helper: "Across documentation and intake",
    icon: Clock3,
    featured: false,
  },
] as const;

export const recentActivity = [
  {
    title: "Generated SOAP note for follow-up visit",
    detail: "Dr. Maya Chen reviewed and signed the note.",
    time: "8 min ago",
    icon: FileHeart,
    featured: false,
  },
  {
    title: "Cyber Hygiene scan completed",
    detail: "MFA coverage improved by 12% after staff remediation.",
    time: "23 min ago",
    icon: ShieldCheck,
    featured: true,
  },
  {
    title: "Smart Intake packet submitted",
    detail: "New patient form triaged and routed to front desk.",
    time: "41 min ago",
    icon: ClipboardCheck,
    featured: false,
  },
  {
    title: "Weekly operations summary prepared",
    detail: "AI highlighted 6 avoidable admin bottlenecks.",
    time: "1 hr ago",
    icon: Activity,
    featured: false,
  },
] as const;

export const cyberReadinessSignals = [
  "Staff MFA enrollment: 92%",
  "Device patch compliance: 87%",
  "High-risk mailbox exposure: 2 accounts",
] as const;
