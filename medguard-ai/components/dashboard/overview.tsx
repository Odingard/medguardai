"use client";

import Link from "next/link";
import { ArrowUpRight, FlaskConical, ShieldAlert, Stethoscope, UsersRound } from "lucide-react";

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
import { Progress } from "@/components/ui/progress";
import { cyberRiskScore } from "@/lib/cyber-hygiene/data";
import { cyberReadinessSignals } from "@/lib/dashboard/mock-data";
import { pendingLabs } from "@/lib/dashboard/labs";
import { getPatientCommandMetrics, getRiskBadgeClass } from "@/lib/patients/command-center";
import { usePatientStore } from "@/lib/stores/patientStore";

export function DashboardOverview() {
  const { patients, currentPatientId, openPatientWorkspace } = usePatientStore();
  const assignedPatients = patients.slice(0, 5);
  const providersLoggedIn = 3;
  const currentPatient =
    patients.find((patient) => patient.id === currentPatientId) ?? patients[0];

  return (
    <div className="space-y-8">
      <OnboardingTour />
      <section className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <Card className="border-primary/20 bg-[linear-gradient(135deg,_hsl(var(--card)),_hsl(var(--secondary)))]">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="success">Provider command center</Badge>
              <Badge variant="outline">Focused daily view</Badge>
            </div>
            <CardTitle className="text-3xl">
              Today: patients, labs, and cyber posture.
            </CardTitle>
            <CardDescription className="max-w-3xl text-base leading-7">
              This overview is intentionally focused: see who is assigned to you,
              which labs need review, and whether practice cyber hygiene needs attention.
            </CardDescription>
          </CardHeader>
          <CardContent className="rounded-xl border bg-card/70 p-4 text-sm">
            <p className="font-semibold">Current Patient: {currentPatient.name}</p>
            <p className="mt-1 text-muted-foreground">
              Open the patient workspace to work inside their chart context.
            </p>
            <Button className="mt-3" asChild onClick={() => openPatientWorkspace(currentPatient.id)}>
              <Link href={`/dashboard/patient/${currentPatient.id}`}>
                Open current patient
                <ArrowUpRight />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/80 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="success">Cyber Hygiene</Badge>
              <ShieldAlert className="size-5 text-emerald-700 dark:text-emerald-300" />
            </div>
            <CardTitle>Practice cyber posture</CardTitle>
            <CardDescription>
              Security posture stays global, not inside individual patient charts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-semibold text-emerald-700 dark:text-emerald-300">
                  {cyberRiskScore.score}
                </span>
                <span className="text-sm text-muted-foreground">Target: 90+</span>
              </div>
              <Progress value={cyberRiskScore.score} className="mt-3 bg-emerald-200" />
            </div>
            <ul className="space-y-2 text-sm">
              {cyberReadinessSignals.map((signal) => (
                <li key={signal} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  {signal}
                </li>
              ))}
            </ul>
            <Button variant="outline" asChild>
              <Link href="/dashboard/cyber-hygiene">Open Cyber Hygiene</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Stethoscope className="size-5 text-primary" />
              <CardTitle>Providers logged in</CardTitle>
            </div>
            <CardDescription>
              Active provider sessions across the practice workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold">{providersLoggedIn}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Demo metric until Supabase presence is connected.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UsersRound className="size-5 text-primary" />
              <CardTitle>Assigned patients</CardTitle>
            </div>
            <CardDescription>
              Patients assigned to this provider today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold">{assignedPatients.length}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Open the list below to work a patient chart.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FlaskConical className="size-5 text-primary" />
              <CardTitle>Labs pending</CardTitle>
            </div>
            <CardDescription>
              Labs waiting for provider review or patient follow-up.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold">{pendingLabs.length}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Prioritize review before starting visits.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UsersRound className="size-5 text-primary" />
              <CardTitle>Patients assigned to you</CardTitle>
            </div>
            <CardDescription>
              Click a patient to open their workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignedPatients.map((patient) => {
              const metrics = getPatientCommandMetrics(patient);

              return (
                <Link
                  key={patient.id}
                  href={`/dashboard/patient/${patient.id}`}
                  onClick={() => openPatientWorkspace(patient.id)}
                  className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-muted-foreground">
                      DOB {patient.dob} · Last visit {patient.lastVisit}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Badge variant="outline">{metrics.notesCount} notes</Badge>
                    <Badge variant="outline" className={getRiskBadgeClass(metrics.cyberRisk)}>
                      {metrics.cyberRisk}
                    </Badge>
                  </div>
                </Link>
              );
            })}
            <Button variant="outline" asChild>
              <Link href="/dashboard/patients">View all patients</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FlaskConical className="size-5 text-primary" />
              <CardTitle>Labs pending review</CardTitle>
            </div>
            <CardDescription>
              Labs that need provider review or patient follow-up.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingLabs.map((lab) => (
              <Link
                key={lab.id}
                href={`/dashboard/patient/${lab.patientId}`}
                onClick={() => openPatientWorkspace(lab.patientId)}
                className="block rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{lab.test}</p>
                  <Badge variant={lab.priority === "Routine" ? "outline" : "secondary"}>
                    {lab.priority}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lab.patientName} · {lab.received}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{lab.summary}</p>
              </Link>
            ))}
            <Button variant="outline" asChild>
              <Link href="/dashboard/patients">Open patient work queue</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
