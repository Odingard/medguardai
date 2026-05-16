"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type OnboardingStore = {
  onboardingCompleted: boolean;
  skippedOnboarding: boolean;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  restartOnboarding: () => void;
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      onboardingCompleted: false,
      skippedOnboarding: false,
      completeOnboarding: () =>
        set({ onboardingCompleted: true, skippedOnboarding: false }),
      skipOnboarding: () =>
        set({ onboardingCompleted: false, skippedOnboarding: true }),
      restartOnboarding: () =>
        set({ onboardingCompleted: false, skippedOnboarding: false }),
    }),
    {
      name: "medguard-onboarding-store",
      partialize: (state) => ({
        onboardingCompleted: state.onboardingCompleted,
        skippedOnboarding: state.skippedOnboarding,
      }),
    },
  ),
);
