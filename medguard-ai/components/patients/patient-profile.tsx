"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, UserRound } from "lucide-react";

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
  type MockPatient,
} from "@/lib/clinical-notes/data";
import { patientWorkspaceTabs } from "@/lib/dashboard/navigation";
import { getPatientCommandMetrics } from "@/lib/patients/command-center";
import { usePatientStore } from "@/lib/stores/patientStore";
import { cn } from "@/lib/utils";

type PatientProfileProps = {
  patientId: string;
};

type PatientMetrics = ReturnType<typeof getPatientCommandMetrics>;

export function PatientProfile({ patientId }: PatientProfileProps) {
  const {
    patients,
    currentPatientId,
    openPatientWorkspace,
    setCurrentPatient,
    prepareClinicalNoteHandoff,
  } = usePatientStore();
  const patient = patients.find((item) => item.id === patientId) ?? patients[0];
  const metrics = getPatientCommandMetrics(patient);
  const active = patient.id === currentPatientId;
  const [activeTab, setActiveTab] = useState("visit-prep");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => openPatientWorkspace(patient.id), 0);
    return () => window.clearTimeout(timeoutId);
  }, [openPatientWorkspace, patient.id]);

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
        `Compliance/admin flags: ${prep.cyberComplianceFlags.join("; ")}`,
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/patients">
            <ArrowLeft className="size-4" />
            Back to patients
          </Link>
        </Button>
        {active ? <Badge variant="success">Current Patient</Badge> : null}
      </div>

      <Card className="overflow-hidden border-primary/15">
        <CardHeader className="bg-primary/[0.03] pb-4">
          <div className="flex items-start gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <UserRound className="size-7" />
            </span>
            <div className="min-w-0">
              <CardTitle className="text-2xl">{patient.name}</CardTitle>
              <CardDescription className="mt-0.5">
                DOB {patient.dob} · Age {patient.age} · {patient.reason}
              </CardDescription>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline">{metrics.notesCount} notes</Badge>
                <Badge variant={metrics.intakePending ? "secondary" : "success"}>
                  {metrics.intakePending ? "Intake pending" : "Intake clear"}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <div className="border-t bg-card">
          <div className="flex overflow-x-auto px-2">
            {patientWorkspaceTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {tab.title}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {activeTab === "visit-prep" ? (
        <VisitPrepTab metrics={metrics} onStartVisit={prepareVisitPrepHandoff} />
      ) : null}
      {activeTab === "clinical-notes" ? (
        <ClinicalNotesTab metrics={metrics} onStartVisit={prepareVisitPrepHandoff} />
      ) : null}
      {activeTab === "smart-intake" ? <SmartIntakeTab metrics={metrics} /> : null}
      {activeTab === "legal-docs" ? <LegalDocsTab metrics={metrics} /> : null}
      {activeTab === "data-migration" ? <DataMigrationTab patient={patient} /> : null}
      {activeTab === "ehr-push" ? <EhrPushTab onPush={pushLatestNoteToEhr} /> : null}

      <TimelineCard metrics={metrics} />
    </div>
  );
}

function VisitPrepTab({
  metrics,
  onStartVisit,
}: {
  metrics: PatientMetrics;
  onStartVisit: () => void;
}) {
  const prep = metrics.visitPrep;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Visit Prep</CardTitle>
          <Button size="sm" onClick={onStartVisit}>Start Visit</Button>
        </div>
        <CardDescription>
          AI-ready pre-visit summary for faster note creation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">{prep.summary}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoBlock title="Medications" items={prep.medications} />
          <InfoBlock title="Allergies" items={prep.allergies} />
          <InfoBlock title="Pending items" items={prep.pendingItems} list />
          <InfoBlock title="Talking points" items={prep.talkingPoints} list />
        </div>
        <div className="rounded-xl border bg-muted/40 p-3">
          <p className="font-semibold">Compliance / admin reminders</p>
          <p className="text-muted-foreground">
            {prep.cyberComplianceFlags.join("; ")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoBlock({
  title,
  items,
  list = false,
}: {
  title: string;
  items: string[];
  list?: boolean;
}) {
  return (
    <div className="rounded-xl border p-3">
      <p className="font-semibold">{title}</p>
      {list ? (
        <ul className="list-inside list-disc text-muted-foreground">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">{items.join(", ")}</p>
      )}
    </div>
  );
}

function ClinicalNotesTab({
  metrics,
  onStartVisit,
}: {
  metrics: PatientMetrics;
  onStartVisit: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Clinical Notes</CardTitle>
          <Button size="sm" onClick={onStartVisit}>New note</Button>
        </div>
        <CardDescription>
          Recent notes and note actions for this patient.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {metrics.recentNotes.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No clinical notes yet. Start a visit to create one.
          </p>
        ) : null}
        {metrics.recentNotes.map((note) => (
          <div key={note.id} className="rounded-xl border bg-card p-3.5">
            <p className="font-medium">{note.title}</p>
            <p className="text-xs text-muted-foreground">{note.date}</p>
            <p className="mt-1 text-sm text-muted-foreground">{note.summary}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SmartIntakeTab({ metrics }: { metrics: PatientMetrics }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Smart Intake</CardTitle>
        <CardDescription>Recent intake packets for this patient.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {metrics.recentIntakes.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No intake records yet.</p>
        ) : null}
        {metrics.recentIntakes.map((intake) => (
          <div key={intake.id} className="rounded-xl border bg-card p-3.5">
            <p className="font-medium">{intake.title}</p>
            <p className="text-xs text-muted-foreground">{intake.status} · {intake.date}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function LegalDocsTab({ metrics }: { metrics: PatientMetrics }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Legal Documents</CardTitle>
        <CardDescription>Active patient documents and generation actions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {metrics.legalDocuments.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No legal documents yet.</p>
        ) : null}
        {metrics.legalDocuments.map((doc) => (
          <div key={doc.id} className="rounded-xl border bg-card p-3.5">
            <p className="font-medium">{doc.title}</p>
            <p className="text-xs text-muted-foreground">{doc.status} · {doc.date}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DataMigrationTab({ patient }: { patient: MockPatient }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Data Migration</CardTitle>
        <CardDescription>Legacy records and import continuation for this patient.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Continue importing legacy documents, PDFs, scans, or EHR exports for {patient.name}.
        </p>
      </CardContent>
    </Card>
  );
}

function EhrPushTab({ onPush }: { onPush: () => void }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>EHR Push</CardTitle>
        <CardDescription>Copy the latest note payload for Chrome Extension push.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>Prepare the most recent SOAP summary for EHR insertion or clipboard handoff.</p>
        <Button variant="outline" onClick={onPush}>
          <Copy className="size-4" />
          Push latest note to EHR
        </Button>
      </CardContent>
    </Card>
  );
}

function TimelineCard({ metrics }: { metrics: PatientMetrics }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Timeline</CardTitle>
        <CardDescription>Activity across this patient workspace.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {metrics.timeline
          .filter((event) => event.module !== "Cyber Hygiene")
          .map((event) => (
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
  );
}
