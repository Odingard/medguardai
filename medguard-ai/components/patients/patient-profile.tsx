"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ClipboardCheck,
  Copy,
  DatabaseZap,
  FileHeart,
  FileText,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  buildPlainTextSoap,
  clinicalTemplates,
  generateMockSoapNote,
} from "@/lib/clinical-notes/data";
import {
  getPatientCommandMetrics,
  getRiskBadgeClass,
} from "@/lib/patients/command-center";
import { usePatientStore } from "@/lib/stores/patientStore";

type PatientProfileProps = {
  patientId: string;
};

export function PatientProfile({ patientId }: PatientProfileProps) {
  const { patients, currentPatientId, setCurrentPatient, prepareClinicalNoteHandoff } =
    usePatientStore();
  const patient = patients.find((item) => item.id === patientId) ?? patients[0];
  const metrics = getPatientCommandMetrics(patient);
  const active = patient.id === currentPatientId;

  function prepareVisitPrepHandoff() {
    const prep = metrics.visitPrep;

    setCurrentPatient(patient.id);
    prepareClinicalNoteHandoff({
      patientId: patient.id,
      source: "patient-directory",
      prefill: [
        `Visit Prep for ${patient.name}`,
        prep.summary,
        "",
        `Medications: ${prep.medications.join(", ")}`,
        `Allergies: ${prep.allergies.join(", ")}`,
        `Pending items: ${prep.pendingItems.join("; ")}`,
        `Suggested talking points: ${prep.talkingPoints.join("; ")}`,
        `Cyber/compliance flags: ${prep.cyberComplianceFlags.join("; ")}`,
      ].join("\n"),
    });
  }

  async function pushLatestNoteToEhr() {
    setCurrentPatient(patient.id);
    const note = generateMockSoapNote({
      patient,
      template: clinicalTemplates[0],
      input: `Latest patient profile context. Reason: ${patient.reason}. Last visit: ${patient.lastVisit}.`,
    });

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(buildPlainTextSoap(note));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" asChild>
          <Link href="/dashboard/patients">
            <ArrowLeft />
            Back to patients
          </Link>
        </Button>
        {active ? <Badge variant="success">Current Patient</Badge> : null}
      </div>

      <Card className="border-primary/20 bg-[linear-gradient(135deg,_hsl(var(--card)),_hsl(var(--secondary)))]">
        <CardHeader>
          <div className="flex items-start gap-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <UserRound className="size-8" />
            </span>
            <div>
              <CardTitle className="text-3xl">{patient.name}</CardTitle>
              <CardDescription>
                Patient Individual Profile · DOB {patient.dob} · Age {patient.age}
              </CardDescription>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline" className={getRiskBadgeClass(metrics.cyberRisk)}>
                  Cyber Risk: {metrics.cyberRisk} ({metrics.cyberScore})
                </Badge>
                <Badge variant="outline">{metrics.notesCount} notes</Badge>
                <Badge variant={metrics.intakePending ? "secondary" : "success"}>
                  {metrics.intakePending ? "Intake pending" : "Intake clear"}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={() => setCurrentPatient(patient.id)}>
            <ShieldCheck />
            Set as Current Patient
          </Button>
          <Button asChild onClick={prepareVisitPrepHandoff}>
            <Link href="/dashboard/clinical-notes">
              <FileHeart />
              Start Visit
            </Link>
          </Button>
          <Button variant="outline" asChild onClick={() => setCurrentPatient(patient.id)}>
            <Link href="/dashboard/smart-intake">
              <ClipboardCheck />
              New Smart Intake
            </Link>
          </Button>
          <Button variant="outline" asChild onClick={() => setCurrentPatient(patient.id)}>
            <Link href="/dashboard/legal-documents">
              <FileText />
              Generate Legal Document
            </Link>
          </Button>
          <Button variant="outline" asChild onClick={() => setCurrentPatient(patient.id)}>
            <Link href="/dashboard/data-migration">
              <DatabaseZap />
              Migrate More Data
            </Link>
          </Button>
          <Button variant="outline" onClick={pushLatestNoteToEhr}>
            <Copy />
            Push Latest Note to EHR
          </Button>
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Visit Prep</CardTitle>
            <CardDescription>
              AI-ready pre-visit summary for faster note creation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-muted-foreground">{metrics.visitPrep.summary}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border p-3">
                <p className="font-semibold">Medications</p>
                <p className="text-muted-foreground">
                  {metrics.visitPrep.medications.join(", ")}
                </p>
              </div>
              <div className="rounded-xl border p-3">
                <p className="font-semibold">Allergies</p>
                <p className="text-muted-foreground">
                  {metrics.visitPrep.allergies.join(", ")}
                </p>
              </div>
              <div className="rounded-xl border p-3">
                <p className="font-semibold">Pending items</p>
                <ul className="list-inside list-disc text-muted-foreground">
                  {metrics.visitPrep.pendingItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border p-3">
                <p className="font-semibold">Talking points</p>
                <ul className="list-inside list-disc text-muted-foreground">
                  {metrics.visitPrep.talkingPoints.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
              <p className="font-semibold">Cyber / compliance flags</p>
              <p>{metrics.visitPrep.cyberComplianceFlags.join("; ")}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {metrics.recentNotes.map((note) => (
                <Link
                  key={note.id}
                  href="/dashboard/clinical-notes"
                  onClick={prepareVisitPrepHandoff}
                  className="block rounded-xl border bg-card p-3 transition-colors hover:bg-muted/50"
                >
                  <p className="font-medium">{note.title}</p>
                  <p className="text-xs text-muted-foreground">{note.date}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{note.summary}</p>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>Activity across MedGuard modules.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {metrics.timeline.map((event) => (
                <div key={event.id} className="rounded-xl border bg-card p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{event.title}</p>
                    <Badge variant="outline">{event.module}</Badge>
                  </div>
                  <p className="mt-1 text-muted-foreground">{event.detail}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{event.time}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
