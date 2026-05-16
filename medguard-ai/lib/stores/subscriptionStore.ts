"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  getPlan,
  hasFeature,
  type FeatureKey,
  type PlanId,
} from "@/lib/billing/plans";

type SubscriptionStore = {
  currentPlanId: PlanId;
  providerCount: number;
  stripeCustomerId?: string;
  setCurrentPlan: (planId: PlanId) => void;
  setProviderCount: (providerCount: number) => void;
  setStripeCustomerId: (customerId: string) => void;
  hasFeature: (feature: FeatureKey) => boolean;
  getCurrentPlanName: () => string;
};

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      currentPlanId: "pro",
      providerCount: 1,
      setCurrentPlan: (planId) => set({ currentPlanId: planId }),
      setProviderCount: (providerCount) =>
        set({ providerCount: Math.max(1, providerCount) }),
      setStripeCustomerId: (customerId) =>
        set({ stripeCustomerId: customerId }),
      hasFeature: (feature) => hasFeature(get().currentPlanId, feature),
      getCurrentPlanName: () => getPlan(get().currentPlanId).name,
    }),
    {
      name: "medguard-subscription-store",
      partialize: (state) => ({
        currentPlanId: state.currentPlanId,
        providerCount: state.providerCount,
        stripeCustomerId: state.stripeCustomerId,
      }),
    },
  ),
);
