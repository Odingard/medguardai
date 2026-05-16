import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { dashboardNavigation } from "@/lib/dashboard/navigation";

const moduleCopy: Record<
  string,
  {
    title: string;
    description: string;
    status: string;
    progress: number;
    points: string[];
  }
> = {
  "clinical-notes": {
    title: "Clinical Notes",
    description:
      "Generate structured visit notes, SOAP summaries, and follow-up documentation with provider review built in.",
    status: "Starter workflow",
    progress: 35,
    points: [
      "Visit note queue",
      "AI-assisted SOAP drafts",
      "Provider review and sign-off",
    ],
  },
  "smart-intake": {
    title: "Smart Intake",
    description:
      "Collect, triage, and summarize patient intake packets before the patient reaches the exam room.",
    status: "Starter workflow",
    progress: 30,
    points: ["Patient forms", "Triage summary", "Front-desk routing"],
  },
  "legal-documents": {
    title: "Legal Documents",
    description:
      "Organize practice documents, consent packets, and administrative legal workflows.",
    status: "Starter workflow",
    progress: 20,
    points: ["Document vault", "Consent templates", "Review reminders"],
  },
  "cyber-hygiene": {
    title: "Cyber Hygiene",
    description:
      "MedGuard AI's differentiator: agentic security posture checks, risk scoring, and remediation tasks sized for small practices.",
    status: "Priority module",
    progress: 55,
    points: [
      "MFA and mailbox exposure checks",
      "Device patch and backup posture",
      "Actionable remediation playbooks",
    ],
  },
  "data-migration": {
    title: "Data Migration",
    description:
      "Plan imports, validate datasets, and track source-to-target migration readiness for practice systems.",
    status: "Starter workflow",
    progress: 25,
    points: ["Source inventory", "Field mapping", "Validation reports"],
  },
};

type ModulePageProps = {
  params: Promise<{
    module: string;
  }>;
};

export default async function ModulePage({ params }: ModulePageProps) {
  const { module } = await params;
  const moduleDetails = moduleCopy[module];
  const navigationItem = dashboardNavigation.find((item) =>
    item.href.endsWith(module),
  );

  if (!moduleDetails || !navigationItem) {
    notFound();
  }

  const Icon = navigationItem.icon;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
            Module
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {moduleDetails.title}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {moduleDetails.description}
          </p>
        </div>
        <Badge variant={module === "cyber-hygiene" ? "success" : "secondary"}>
          {moduleDetails.status}
        </Badge>
      </div>

      <Card
        className={
          module === "cyber-hygiene"
            ? "border-emerald-300 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/20"
            : undefined
        }
      >
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Icon className="size-5" />
            </span>
            <div>
              <CardTitle>{moduleDetails.title} foundation</CardTitle>
              <CardDescription>
                Production-minded placeholder for the next module build.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>Foundation readiness</span>
              <span>{moduleDetails.progress}%</span>
            </div>
            <Progress value={moduleDetails.progress} />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {moduleDetails.points.map((point) => (
              <div key={point} className="rounded-lg border bg-card p-4 text-sm">
                {point}
              </div>
            ))}
          </div>
          <Button>{module === "cyber-hygiene" ? "Build Cyber Hygiene" : "Plan module"}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
