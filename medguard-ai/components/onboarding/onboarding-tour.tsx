"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  FileHeart,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";

const onboardingSteps = [
  {
    title: "Welcome to MedGuard AI",
    description:
      "A five-module command center for small medical practices: notes, intake, legal documents, cyber hygiene, and data migration.",
    icon: Sparkles,
    href: "/dashboard",
    action: "See overview",
  },
  {
    title: "Create or select your first patient",
    description:
      "Shared patient context connects every module so workflows can move from intake to notes to documents.",
    icon: UserPlus,
    href: "/dashboard/patients",
    action: "Open patients",
  },
  {
    title: "Try Clinical Notes",
    description:
      "Generate a SOAP note from ambient dictation, typed input, or Smart Intake handoff.",
    icon: FileHeart,
    href: "/dashboard/clinical-notes",
    action: "Try notes",
  },
  {
    title: "Run a Cyber Scan",
    description:
      "Show the differentiator: agentic cyber checks that do not require PHI for early testing.",
    icon: ShieldCheck,
    href: "/dashboard/cyber-hygiene",
    action: "Open cyber",
  },
  {
    title: "Try Smart Intake",
    description:
      "Build an intake form and send structured answers directly into Clinical Notes.",
    icon: ClipboardCheck,
    href: "/dashboard/smart-intake",
    action: "Try intake",
  },
] as const;

export function OnboardingTour() {
  const { onboardingCompleted, skippedOnboarding, completeOnboarding, skipOnboarding } =
    useOnboardingStore();
  const [stepIndex, setStepIndex] = useState(0);
  const step = onboardingSteps[stepIndex];
  const Icon = step.icon;
  const progress = ((stepIndex + 1) / onboardingSteps.length) * 100;
  const open = !onboardingCompleted && !skippedOnboarding;
  const isLastStep = stepIndex === onboardingSteps.length - 1;

  function handleNext() {
    if (isLastStep) {
      completeOnboarding();
      return;
    }

    setStepIndex((current) => current + 1);
  }

  function handleBack() {
    setStepIndex((current) => Math.max(0, current - 1));
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!nextOpen) {
        skipOnboarding();
      }
    }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-8">
            <Badge variant="success">
              Step {stepIndex + 1} of {onboardingSteps.length}
            </Badge>
            <Button variant="ghost" size="sm" onClick={skipOnboarding}>
              Skip
            </Button>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Icon className="size-6" />
            </span>
            <div>
              <DialogTitle>{step.title}</DialogTitle>
              <DialogDescription className="mt-1">
                {step.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <Progress value={progress} />
          <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
            Tip: You can restart this tour from the Overview after skipping or
            completing it.
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={stepIndex === 0}
            >
              Back
            </Button>
            <Button onClick={handleNext}>
              {isLastStep ? "Finish tour" : "Next"}
            </Button>
          </div>
          <Button variant="outline" asChild onClick={completeOnboarding}>
            <Link href={step.href}>{step.action}</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
