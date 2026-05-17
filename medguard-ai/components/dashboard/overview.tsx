"use client";

import Link from "next/link";
import {
  Activity,
  FlaskConical,
  ShieldCheck,
  Stethoscope,
  UsersRound,
} from "lucide-react";

import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cyberRiskScore } from "@/lib/cyber-hygiene/data";
import { recentActivity } from "@/lib/dashboard/mock-data";
import { pendingLabs } from "@/lib/dashboard/labs";
import {
  getPatientCommandMetrics,
  getRiskBadgeClass,
} from "@/lib/patients/command-center";
import { usePatientStore } from "@/lib/stores/patientStore";

const activeProviders = [
  {
    id: "prov-001",
    name: "Dr. Maya Chen",
    initials: "MC",
    role: "Family Medicine",
    status: "Charting",
  },
  {
    id: "prov-002",
    name: "Dr. James Okafor",
    initials: "JO",
    role: "Internal Medicine",
    status: "Reviewing labs",
  },
  {
    id: "prov-003",
    name: "NP Sarah Lin",
    initials: "SL",
    role: "Nurse Practitioner",
    status: "In visit",
  },
] as const;

export function DashboardOverview() {
  const { patients, currentPatientId, openPatientWorkspace } =
    usePatientStore();
  const assignedPatients = patients.slice(0, 5);

  return (
    <div className="space-y-6">
      <OnboardingTour />

      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Overview
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Good morning, Doctor.
        </h1>
        <p className="mt-1 max-w-lg text-sm text-muted-foreground">
          {assignedPatients.length} patients assigned · {pendingLabs.length}{" "}
          labs pending review
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Providers online
              </p>
              <div className="mt-1 flex items-end gap-2">
                <p className="text-3xl font-semibold tracking-tight">
                  {activeProviders.length}
                </p>
                <span className="pb-1 text-xs text-emerald-600 dark:text-emerald-300">
                  live now
                </span>
              </div>
            </div>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
              <Stethoscope className="size-5" />
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {activeProviders.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center gap-3 rounded-xl bg-secondary/50 p-2"
              >
                <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {provider.initials}
                  <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-card bg-emerald-500" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{provider.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {provider.role}
                  </p>
                </div>
                <span className="rounded-full bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground">
                  {provider.status}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-3 rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            Team handoff: 2 notes drafting · 1 lab review in progress
          </p>
        </div>

        <StatCard
          icon={UsersRound}
          label="Assigned patients"
          value={String(assignedPatients.length)}
          helper="Click a patient below to start"
        />
        <StatCard
          icon={FlaskConical}
          label="Labs pending"
          value={String(pendingLabs.length)}
          helper="Prioritize before starting visits"
        />
        <Link href="/dashboard/cyber-hygiene" className="contents">
          <StatCard
            icon={ShieldCheck}
            label="Cyber hygiene score"
            value={String(cyberRiskScore.score)}
            helper={`Target: 90+ · ${cyberRiskScore.score >= 90 ? "On track" : `${90 - cyberRiskScore.score} points to go`}`}
            variant="cyber"
          />
        </Link>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UsersRound className="size-5 text-primary" />
                <CardTitle>Patients assigned to you</CardTitle>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/patients">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {assignedPatients.map((patient) => {
              const metrics = getPatientCommandMetrics(patient);
              const isCurrent = patient.id === currentPatientId;

              return (
                <Link
                  key={patient.id}
                  href={`/dashboard/patient/${patient.id}`}
                  onClick={() => openPatientWorkspace(patient.id)}
                  className={
                    "flex items-center justify-between gap-3 rounded-xl border p-3.5 transition-colors hover:bg-muted/50 " +
                    (isCurrent
                      ? "border-primary/30 bg-primary/[0.03]"
                      : "bg-card")
                  }
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{patient.name}</p>
                      {isCurrent ? (
                        <Badge variant="success" className="text-[10px]">
                          Current
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      DOB {patient.dob} · Last visit {patient.lastVisit}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Badge variant="outline">{metrics.notesCount} notes</Badge>
                    <Badge
                      variant="outline"
                      className={getRiskBadgeClass(metrics.cyberRisk)}
                    >
                      {metrics.cyberRisk}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="size-5 text-primary" />
                <CardTitle>Labs pending review</CardTitle>
              </div>
              <Badge variant="secondary">{pendingLabs.length} pending</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingLabs.map((lab) => (
              <Link
                key={lab.id}
                href={`/dashboard/patient/${lab.patientId}`}
                onClick={() => openPatientWorkspace(lab.patientId)}
                className="block rounded-xl border bg-card p-3.5 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{lab.test}</p>
                  <Badge
                    variant={
                      lab.priority === "Routine" ? "outline" : "secondary"
                    }
                  >
                    {lab.priority}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {lab.patientName} · {lab.received}
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {lab.summary}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-primary" />
            <CardTitle>Recent activity</CardTitle>
          </div>
          <CardDescription>
            Latest actions across the practice workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {recentActivity.map((event) => {
              const Icon = event.icon;
              return (
                <div
                  key={event.title}
                  className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span
                    className={
                      "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg " +
                      (event.featured
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                        : "bg-secondary text-muted-foreground")
                    }
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.detail}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {event.time}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type StatCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  helper: string;
  variant?: "default" | "cyber";
};

function StatCard({
  icon: Icon,
  label,
  value,
  helper,
  variant = "default",
}: StatCardProps) {
  const isCyber = variant === "cyber";

  return (
    <div
      className={
        "flex items-start gap-4 rounded-2xl border p-4 transition-colors " +
        (isCyber
          ? "border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50"
          : "bg-card")
      }
    >
      <span
        className={
          "flex size-10 shrink-0 items-center justify-center rounded-xl " +
          (isCyber
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
            : "bg-secondary text-muted-foreground")
        }
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold tracking-tight">{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{helper}</p>
      </div>
    </div>
  );
}
