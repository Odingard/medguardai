import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  FileCheck2,
  KeyRound,
  MailWarning,
  Radar,
  ShieldCheck,
  ShieldQuestion,
  Siren,
  UserCheck,
} from "lucide-react";

export type RiskLevel = "low" | "medium" | "high";
export type AlertSeverity = "critical" | "high" | "medium" | "low";
export type AgentId =
  | "domain-breach-monitor"
  | "weak-password-detector"
  | "phishing-simulation-runner"
  | "weekly-compliance-report-generator";

export const cyberRiskScore = {
  score: 84,
  level: "low" as RiskLevel,
  lastScanned: "Today at 8:42 AM",
  trend: "+6 points since last week",
  summary:
    "Low risk overall. Two mailbox exposures and one compliance evidence gap still need review.",
};

export const cyberMetrics = [
  {
    title: "Breach Exposure",
    value: "2",
    detail: "exposed staff accounts",
    helper: "14 domains/emails checked",
    status: "medium" as RiskLevel,
    icon: MailWarning,
    progress: 72,
  },
  {
    title: "Password Health",
    value: "91%",
    detail: "strong credential posture",
    helper: "3 weak passwords flagged",
    status: "low" as RiskLevel,
    icon: KeyRound,
    progress: 91,
  },
  {
    title: "Phishing Readiness",
    value: "78%",
    detail: "staff simulation score",
    helper: "2 users need coaching",
    status: "medium" as RiskLevel,
    icon: UserCheck,
    progress: 78,
  },
  {
    title: "Compliance Status",
    value: "88%",
    detail: "HIPAA basics complete",
    helper: "1 missing policy attestation",
    status: "low" as RiskLevel,
    icon: FileCheck2,
    progress: 88,
  },
] as const;

export const cyberAgents = [
  {
    id: "domain-breach-monitor" as AgentId,
    name: "Domain Breach Monitor",
    description:
      "Checks practice domains and staff emails against breach exposure sources.",
    enabled: true,
    cadence: "Daily",
    lastRun: "8:42 AM",
    result: "2 exposed accounts found",
    icon: Radar,
  },
  {
    id: "weak-password-detector" as AgentId,
    name: "Weak Password Detector",
    description:
      "Looks for weak credential patterns and staff accounts missing MFA.",
    enabled: true,
    cadence: "Daily",
    lastRun: "7:30 AM",
    result: "3 weak passwords flagged",
    icon: KeyRound,
  },
  {
    id: "phishing-simulation-runner" as AgentId,
    name: "Phishing Simulation Runner",
    description:
      "Runs safe mock phishing checks and tracks staff coaching opportunities.",
    enabled: false,
    cadence: "Monthly",
    lastRun: "Friday",
    result: "78% staff readiness score",
    icon: ShieldQuestion,
  },
  {
    id: "weekly-compliance-report-generator" as AgentId,
    name: "Weekly Compliance Report Generator",
    description:
      "Summarizes HIPAA basics, security tasks, and practice leadership actions.",
    enabled: true,
    cadence: "Weekly",
    lastRun: "Monday",
    result: "Report delivered to admin",
    icon: Bot,
  },
] as const;

export const agentActivity = [
  {
    time: "8:42 AM",
    agent: "Domain Breach Monitor",
    detail: "Matched 2 staff emails against known exposure records.",
    icon: AlertTriangle,
  },
  {
    time: "7:30 AM",
    agent: "Weak Password Detector",
    detail: "Flagged 3 passwords for rotation and MFA verification.",
    icon: KeyRound,
  },
  {
    time: "Monday",
    agent: "Weekly Compliance Report Generator",
    detail: "Prepared security posture summary for practice leadership.",
    icon: CheckCircle2,
  },
] as const;

export const recentAlerts = [
  {
    date: "May 16, 2026",
    severity: "high" as AlertSeverity,
    description:
      "Front desk mailbox found in third-party breach corpus; password reset recommended.",
    actionTaken: "Rotation task created",
  },
  {
    date: "May 16, 2026",
    severity: "medium" as AlertSeverity,
    description:
      "Two staff members clicked training simulation link during phishing readiness run.",
    actionTaken: "Coaching assigned",
  },
  {
    date: "May 15, 2026",
    severity: "low" as AlertSeverity,
    description:
      "Weekly HIPAA security policy attestation missing one provider signature.",
    actionTaken: "Reminder sent",
  },
  {
    date: "May 14, 2026",
    severity: "critical" as AlertSeverity,
    description:
      "Legacy shared admin account detected without MFA on billing workstation.",
    actionTaken: "Admin notified",
  },
] as const;

export const recommendations = [
  {
    title: "Rotate exposed front desk mailbox password",
    priority: "High",
    impact: "Reduces breach exposure and protects patient scheduling workflows.",
    icon: Siren,
  },
  {
    title: "Require MFA for all billing and admin workstations",
    priority: "High",
    impact: "Closes the most common small-practice account takeover path.",
    icon: ShieldCheck,
  },
  {
    title: "Run targeted phishing coaching for two staff members",
    priority: "Medium",
    impact: "Improves staff readiness without touching PHI.",
    icon: UserCheck,
  },
  {
    title: "Collect missing HIPAA security policy attestation",
    priority: "Low",
    impact: "Keeps compliance evidence complete for leadership review.",
    icon: FileCheck2,
  },
] as const;

export function getRiskTone(score: number) {
  if (score >= 80) {
    return {
      label: "Low risk",
      className:
        "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
      progressClassName: "bg-emerald-500",
    };
  }

  if (score >= 60) {
    return {
      label: "Moderate risk",
      className:
        "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
      progressClassName: "bg-amber-500",
    };
  }

  return {
    label: "High risk",
    className:
      "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300",
    progressClassName: "bg-red-500",
  };
}

export function simulateCyberScan() {
  return {
    completedAt: "Just now",
    summary:
      "Simulated scan complete: no new critical findings, 4 recommendations remain open.",
  };
}

export function simulateAgentRun(agentName: string) {
  return `${agentName} completed a mock run and queued updated findings for review.`;
}
