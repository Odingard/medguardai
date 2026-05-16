import { BarChart3, Building2, ShieldCheck, Sparkles } from "lucide-react";

export type PlanId = "pro" | "premium" | "smb";
export type FeatureKey =
  | "coreNotes"
  | "smartIntake"
  | "basicLegal"
  | "basicCyber"
  | "migration"
  | "advancedCyber"
  | "fullMigration"
  | "advancedTemplates"
  | "advancedAnalytics"
  | "teamSharing"
  | "multiProviderAnalytics"
  | "adminDashboard"
  | "bulkActions"
  | "prioritySupport";

export type SubscriptionPlan = {
  id: PlanId;
  name: string;
  tagline: string;
  monthlyPrice: number;
  providerLimit: number | "group";
  additionalProviderPrice?: number;
  stripeLookupKey: string;
  features: FeatureKey[];
  icon: typeof Sparkles;
};

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "pro",
    name: "Pro",
    tagline: "Core AI workflows for solo providers.",
    monthlyPrice: 99,
    providerLimit: 1,
    stripeLookupKey: "medguard_pro_monthly",
    icon: Sparkles,
    features: [
      "coreNotes",
      "smartIntake",
      "basicLegal",
      "basicCyber",
      "migration",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Advanced templates, cyber agents, analytics, and full migration.",
    monthlyPrice: 199,
    providerLimit: 1,
    stripeLookupKey: "medguard_premium_monthly",
    icon: ShieldCheck,
    features: [
      "coreNotes",
      "smartIntake",
      "basicLegal",
      "basicCyber",
      "migration",
      "advancedCyber",
      "fullMigration",
      "advancedTemplates",
      "advancedAnalytics",
    ],
  },
  {
    id: "smb",
    name: "SMB / Group",
    tagline: "Team features for small and medium practices.",
    monthlyPrice: 299,
    providerLimit: "group",
    additionalProviderPrice: 99,
    stripeLookupKey: "medguard_smb_monthly",
    icon: Building2,
    features: [
      "coreNotes",
      "smartIntake",
      "basicLegal",
      "basicCyber",
      "migration",
      "advancedCyber",
      "fullMigration",
      "advancedTemplates",
      "advancedAnalytics",
      "teamSharing",
      "multiProviderAnalytics",
      "adminDashboard",
      "bulkActions",
      "prioritySupport",
    ],
  },
] as const;

export const featureLabels: Record<FeatureKey, string> = {
  coreNotes: "Clinical Notes",
  smartIntake: "Smart Intake",
  basicLegal: "Basic Legal Documents",
  basicCyber: "Basic Cyber Hygiene",
  migration: "Data Migration",
  advancedCyber: "Advanced Agentic Cyber",
  fullMigration: "Full Migration",
  advancedTemplates: "Advanced Templates",
  advancedAnalytics: "Advanced Analytics / ROI",
  teamSharing: "Team Sharing",
  multiProviderAnalytics: "Multi-provider Analytics",
  adminDashboard: "Admin Dashboard",
  bulkActions: "Bulk Actions",
  prioritySupport: "Priority Support",
};

const planRank: Record<PlanId, number> = {
  pro: 1,
  premium: 2,
  smb: 3,
};

export function getPlan(planId: PlanId) {
  return (
    subscriptionPlans.find((plan) => plan.id === planId) ??
    subscriptionPlans[0]
  );
}

export function hasFeature(planId: PlanId, feature: FeatureKey) {
  return getPlan(planId).features.includes(feature);
}

export function isAtLeastPlan(planId: PlanId, minimumPlanId: PlanId) {
  return planRank[planId] >= planRank[minimumPlanId];
}

export function getRequiredPlanForFeature(feature: FeatureKey): PlanId {
  if (
    [
      "teamSharing",
      "multiProviderAnalytics",
      "adminDashboard",
      "bulkActions",
      "prioritySupport",
    ].includes(feature)
  ) {
    return "smb";
  }

  if (
    [
      "advancedCyber",
      "fullMigration",
      "advancedTemplates",
      "advancedAnalytics",
    ].includes(feature)
  ) {
    return "premium";
  }

  return "pro";
}

export function calculatePlanAmount(planId: PlanId, providers: number) {
  const plan = getPlan(planId);

  if (plan.id !== "smb") {
    return plan.monthlyPrice * Math.max(1, providers);
  }

  return (
    plan.monthlyPrice +
    Math.max(0, providers - 5) * (plan.additionalProviderPrice ?? 99)
  );
}

export const billingUsageStats = [
  {
    label: "Providers",
    value: "3 / 5",
    helper: "SMB includes up to 5 providers",
    icon: Building2,
  },
  {
    label: "AI notes",
    value: "146",
    helper: "Generated this month",
    icon: Sparkles,
  },
  {
    label: "Cyber scans",
    value: "18",
    helper: "Agentic checks this month",
    icon: ShieldCheck,
  },
  {
    label: "ROI estimate",
    value: "$4.8k",
    helper: "Admin time saved",
    icon: BarChart3,
  },
] as const;
