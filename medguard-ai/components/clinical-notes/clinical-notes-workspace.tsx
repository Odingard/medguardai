"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { generateClinicalSoapNoteAction } from "@/app/dashboard/clinical-notes/actions";
import {
  CheckCircle2,
  ClipboardCopy,
  FileText,
  Loader2,
  Mic,
  Plus,
  Save,
  Sparkles,
  Upload,
  UserPlus,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  buildPlainTextSoap,
  clinicalModuleHighlights,
  clinicalTemplates,
  mockCopyToEhr,
  mockSaveNoteToPatientRecord,
  pastNotes,
  specialtyTemplates,
  transcriptionSegments,
  type MockPatient,
  type NoteMode,
  type SoapNote,
} from "@/lib/clinical-notes/data";
import { usePatientStore } from "@/lib/stores/patientStore";
import { cn } from "@/lib/utils";

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

const selectClassName =
  "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type BrowserSpeechRecognitionResult = {
  0?: {
    transcript: string;
  };
};

type BrowserSpeechRecognitionEvent = {
  results: ArrayLike<BrowserSpeechRecognitionResult>;
};

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

function getBrowserSpeechRecognition() {
  const speechWindow = window as Window & {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  };

  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
}

export function ClinicalNotesWorkspace() {
  const {
    patients,
    currentPatientId,
    addPatient,
    setCurrentPatient,
    clinicalNoteHandoff,
    pendingClinicalNotePrefill,
    clearPendingClinicalNotePrefill,
  } = usePatientStore();
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    clinicalTemplates[0].id,
  );
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(
    specialtyTemplates[0],
  );
  const [mode, setMode] = useState<NoteMode>(
    pendingClinicalNotePrefill ? "text" : "voice",
  );
  const [encounterInput, setEncounterInput] = useState(pendingClinicalNotePrefill);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiProviderLabel, setAiProviderLabel] = useState("Mock fallback");
  const [aiWarning, setAiWarning] = useState("");
  const [aiError, setAiError] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    pendingClinicalNotePrefill
      ? "Smart Intake handoff loaded. Review the prefill, then generate the SOAP note."
      : "Select a patient and start with voice, text, upload, or a template.",
  );
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientReason, setNewPatientReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [soapNote, setSoapNote] = useState<SoapNote | null>(null);

  const selectedPatient = useMemo(
    () =>
      patients.find((patient) => patient.id === currentPatientId) ??
      patients[0],
    [patients, currentPatientId],
  );

  const selectedTemplate = useMemo(
    () =>
      clinicalTemplates.find((template) => template.id === selectedTemplateId) ??
      clinicalTemplates[0],
    [selectedTemplateId],
  );

  async function handleStartAmbient() {
    setMode("voice");
    setIsTranscribing(true);
    setEncounterInput("");
    setAiError("");
    setStatusMessage("Requesting browser microphone and listening...");

    try {
      const stream = await navigator.mediaDevices?.getUserMedia?.({
        audio: true,
      });
      stream?.getTracks().forEach((track) => track.stop());

      const Recognition = getBrowserSpeechRecognition();

      if (!Recognition) {
        throw new Error("Browser speech recognition is not supported.");
      }

      await new Promise<void>((resolve, reject) => {
        const recognition = new Recognition();
        let transcript = "";
        let settled = false;
        const settle = (callback: () => void) => {
          if (settled) {
            return;
          }
          settled = true;
          window.clearTimeout(timeoutId);
          callback();
        };
        const timeoutId = window.setTimeout(() => {
          recognition.stop();
          settle(() => {
            if (transcript.trim()) {
              resolve();
            } else {
              reject(new Error("No speech detected before timeout."));
            }
          });
        }, 8000);

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.onresult = (event) => {
          transcript = Array.from(
            { length: event.results.length },
            (_, index) => event.results[index]?.[0]?.transcript ?? "",
          )
            .join(" ")
            .trim();
          setEncounterInput(transcript);
        };
        recognition.onerror = () => {
          settle(() => reject(new Error("Browser speech recognition failed.")));
        };
        recognition.onend = () => {
          settle(() => {
            if (transcript.trim()) {
              resolve();
            } else {
              reject(new Error("Speech recognition ended without transcript."));
            }
          });
        };
        recognition.start();
      });

      setStatusMessage(
        "Browser transcription captured. Review the text, then generate the SOAP note.",
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `${error.message} Showing realistic transcription simulation instead.`
          : "Speech recognition unavailable. Showing realistic transcription simulation instead.",
      );

      let transcript = "";
      for (const segment of transcriptionSegments) {
        transcript = `${transcript}${transcript ? " " : ""}${segment}`;
        setEncounterInput(transcript);
        await wait(650);
      }
    }

    setIsTranscribing(false);
  }

  async function handleGenerateNote() {
    setIsGenerating(true);
    setAiError("");
    setAiWarning("");
    setStatusMessage("Generating SOAP note with MedGuard AI...");

    try {
      const result = await generateClinicalSoapNoteAction({
        patient: selectedPatient,
        template: {
          id: selectedTemplate.id,
          title: selectedTemplate.title,
          description: selectedTemplate.description,
          prompt: selectedTemplate.prompt,
        },
        specialty: selectedSpecialty,
        encounterInput,
      });

      setSoapNote(result.note);
      setAiProviderLabel(`${result.provider} / ${result.model}`);
      setAiWarning(result.warning ?? "");
      clearPendingClinicalNotePrefill();
      setStatusMessage(
        "SOAP note generated. Edit any section, copy to EHR, or save to the mock patient record.",
      );
    } catch (error) {
      setAiError(
        error instanceof Error
          ? error.message
          : "Unable to generate SOAP note. Please try again.",
      );
      setStatusMessage("Clinical note generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopyToEhr() {
    if (soapNote && navigator.clipboard) {
      await navigator.clipboard.writeText(buildPlainTextSoap(soapNote));
    }

    setStatusMessage(mockCopyToEhr());
  }

  async function handlePushToEhr() {
    const fallbackText = [
      `Patient: ${selectedPatient.name}`,
      `DOB: ${selectedPatient.dob}`,
      `Context: ${selectedPatient.reason}`,
      "",
      soapNote
        ? buildPlainTextSoap(soapNote)
        : encounterInput ||
          "No generated SOAP note yet. Generate a note or copy encounter context before EHR push.",
      "",
      "Generated by MedGuard AI. Review before signing.",
    ].join("\n");

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(fallbackText);
      setStatusMessage(
        `EHR Push ready: ${selectedPatient.name}'s latest note/context was copied for the Chrome Extension flow.`,
      );
      return;
    }

    setStatusMessage(
      `EHR Push ready for ${selectedPatient.name}. Use the Chrome Extension on a supported EHR page.`,
    );
  }

  function handleSaveToRecord() {
    setStatusMessage(mockSaveNoteToPatientRecord(selectedPatient.name));
  }

  function handleQuickAddPatient() {
    const trimmedName = newPatientName.trim();
    if (!trimmedName) {
      return;
    }

    const patient: MockPatient = {
      id: `pat-${Date.now()}`,
      name: trimmedName,
      age: 40,
      dob: "Not provided",
      reason: newPatientReason.trim() || "New clinical note",
      lastVisit: "New patient",
    };

    addPatient(patient);
    setNewPatientName("");
    setNewPatientReason("");
    setDialogOpen(false);
    setStatusMessage(`${patient.name} added to the mock patient list.`);
  }

  function updateSoapSection(section: keyof SoapNote, value: string) {
    setSoapNote((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [section]: value,
      };
    });
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <Card className="border-primary/20 bg-[linear-gradient(135deg,_hsl(var(--card)),_hsl(var(--secondary)))]">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="success">Doctor-first note workflow</Badge>
              <Badge variant="outline">Real AI with safe fallback</Badge>
              {clinicalNoteHandoff ? (
                <Badge variant="secondary">Handoff: {clinicalNoteHandoff.source}</Badge>
              ) : null}
            </div>
            <CardTitle className="text-3xl">
              Create a usable SOAP note in under 60 seconds.
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-7">
              Start from ambient voice, typed notes, uploaded context, or a
              specialty template. MedGuard turns raw encounter details into an
              editable SOAP note with suggested E/M codes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3 rounded-xl border bg-card/80 p-4">
              <Button onClick={handlePushToEhr}>
                <ClipboardCopy />
                Push Latest Note to EHR
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/billing#chrome-extension">
                  Install Chrome Extension
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Uses the current patient ({selectedPatient.name}) and generated SOAP note when available.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
            {clinicalModuleHighlights.map((highlight) => {
              const Icon = highlight.icon;

              return (
                <div
                  key={highlight.label}
                  className="rounded-xl border bg-card/80 p-4"
                >
                  <Icon className="size-5 text-primary" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    {highlight.label}
                  </p>
                  <p className="text-2xl font-semibold">{highlight.value}</p>
                </div>
              );
            })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Current Patient</CardTitle>
              <Badge variant="success">{selectedPatient.name}</Badge>
            </div>
            <CardDescription>
              Shared patient context for note generation and saving.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <select
                id="patient"
                value={currentPatientId}
                onChange={(event) => setCurrentPatient(event.target.value)}
                className={selectClassName}
              >
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.reason}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-xl border bg-muted/40 p-4 text-sm">
              <p className="font-semibold">{selectedPatient.name}</p>
              <p className="mt-1 text-muted-foreground">
                Age {selectedPatient.age} · DOB {selectedPatient.dob}
              </p>
              <p className="mt-1 text-muted-foreground">
                Last visit: {selectedPatient.lastVisit}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty-template">Specialty template</Label>
              <select
                id="specialty-template"
                value={selectedSpecialty}
                onChange={(event) => setSelectedSpecialty(event.target.value)}
                className={selectClassName}
              >
                {specialtyTemplates.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <UserPlus />
                  New Patient
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add mock patient</DialogTitle>
                  <DialogDescription>
                    This quick add stays in local UI state for the MVP.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-patient-name">Patient name</Label>
                    <Input
                      id="new-patient-name"
                      value={newPatientName}
                      onChange={(event) =>
                        setNewPatientName(event.target.value)
                      }
                      placeholder="Jordan Lee"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-patient-reason">Visit reason</Label>
                    <Input
                      id="new-patient-reason"
                      value={newPatientReason}
                      onChange={(event) =>
                        setNewPatientReason(event.target.value)
                      }
                      placeholder="Annual wellness visit"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleQuickAddPatient}>
                    <Plus />
                    Add patient
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mic className="size-5 text-primary" />
              <CardTitle>New note</CardTitle>
            </div>
            <CardDescription>
              Use ambient-style transcription or paste/upload source material.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Tabs defaultValue={mode}>
              <TabsList>
                <TabsTrigger
                  active={mode === "voice"}
                  onClick={() => setMode("voice")}
                  type="button"
                >
                  Voice / Ambient
                </TabsTrigger>
                <TabsTrigger
                  active={mode === "text"}
                  onClick={() => setMode("text")}
                  type="button"
                >
                  Text / Upload
                </TabsTrigger>
              </TabsList>
              <TabsContent>
                {mode === "voice" ? (
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={handleStartAmbient}
                      disabled={isTranscribing}
                      className={cn(
                        "flex w-full flex-col items-center justify-center rounded-2xl border border-dashed bg-card p-8 text-center transition-colors hover:border-primary hover:bg-secondary/50",
                        isTranscribing && "border-primary bg-secondary/70",
                      )}
                    >
                      <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                        {isTranscribing ? (
                          <Loader2 className="size-8 animate-spin" />
                        ) : (
                          <Mic className="size-8" />
                        )}
                      </span>
                      <span className="mt-4 text-lg font-semibold">
                        {isTranscribing
                          ? "Transcribing encounter..."
                          : "Start Voice / Ambient"}
                      </span>
                      <span className="mt-2 max-w-lg text-sm text-muted-foreground">
                        Browser mic access is requested when available, then a
                        realistic transcript simulation appears for the MVP.
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-dashed bg-card p-5">
                      <Label htmlFor="note-upload" className="flex items-center gap-2">
                        <Upload className="size-4" />
                        Upload PDFs, images, or previous notes
                      </Label>
                      <Input
                        id="note-upload"
                        type="file"
                        className="mt-3"
                        accept=".pdf,image/*,.txt,.doc,.docx"
                        onChange={(event) =>
                          setUploadedFileName(
                            event.target.files?.[0]?.name ?? "",
                          )
                        }
                      />
                      {uploadedFileName ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Attached for mock context: {uploadedFileName}
                        </p>
                      ) : null}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="encounter-input">Encounter input</Label>
              <Textarea
                id="encounter-input"
                value={encounterInput}
                onChange={(event) => setEncounterInput(event.target.value)}
                placeholder="Dictation, pasted notes, patient history, exam findings, or uploaded-file summary..."
                className="min-h-44"
              />
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={handleGenerateNote} disabled={isGenerating}>
                  {isGenerating ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Sparkles />
                  )}
                  Generate SOAP Note
                </Button>
                <Badge variant="outline">AI: {aiProviderLabel}</Badge>
                <p className="text-sm text-muted-foreground">{statusMessage}</p>
              </div>
              {aiWarning ? (
                <p className="rounded-md border bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                  {aiWarning}
                </p>
              ) : null}
              {aiError ? (
                <p className="rounded-md border border-destructive/50 px-3 py-2 text-sm text-destructive">
                  {aiError}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              <CardTitle>Templates</CardTitle>
            </div>
            <CardDescription>
              Quick-start prompt context for common encounters.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {clinicalTemplates.map((template) => {
              const Icon = template.icon;
              const active = template.id === selectedTemplateId;

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => {
                    setSelectedTemplateId(template.id);
                    setEncounterInput((current) =>
                      current
                        ? `${current}\n\nTemplate context: ${template.prompt}`
                        : `Template context: ${template.prompt}`,
                    );
                  }}
                  className={cn(
                    "rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-secondary/50",
                    active && "border-primary bg-secondary",
                  )}
                >
                  <Icon className="size-5 text-primary" />
                  <p className="mt-3 font-semibold">{template.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {template.description}
                  </p>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Note preview / editor</CardTitle>
                <CardDescription>
                  Edit the generated SOAP note before copying or saving.
                </CardDescription>
              </div>
              {soapNote ? <Badge variant="success">Generated</Badge> : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {soapNote ? (
              <>
                {(
                  [
                    ["subjective", "Subjective"],
                    ["objective", "Objective"],
                    ["assessment", "Assessment"],
                    ["plan", "Plan"],
                  ] as const
                ).map(([section, label]) => (
                  <div key={section} className="space-y-2">
                    <Label htmlFor={`soap-${section}`}>{label}</Label>
                    <Textarea
                      id={`soap-${section}`}
                      value={soapNote[section]}
                      onChange={(event) =>
                        updateSoapSection(section, event.target.value)
                      }
                      className="min-h-28"
                    />
                  </div>
                ))}
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-xl border bg-muted/40 p-4">
                    <p className="text-sm font-semibold">Suggested E/M/CPT codes</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {soapNote.billingCodes.map((code) => (
                        <Badge key={code} variant="outline">
                          {code}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border bg-muted/40 p-4">
                    <p className="text-sm font-semibold">Suggested ICD-10 codes</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {soapNote.icdCodes.map((code) => (
                        <Badge key={code} variant="outline">
                          {code}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border bg-muted/40 p-4">
                    <p className="text-sm font-semibold">AI confidence</p>
                    <p className="mt-3 text-3xl font-semibold">
                      {soapNote.confidence.overall}%
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Billing confidence: {soapNote.confidence.billing}%
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handlePushToEhr}>
                    <ClipboardCopy />
                    Push to EHR
                  </Button>
                  <Button variant="outline" onClick={handleCopyToEhr}>
                    <ClipboardCopy />
                    Copy SOAP text
                  </Button>
                  <Button variant="outline" onClick={handleSaveToRecord}>
                    <Save />
                    Save to patient record
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 p-8 text-center">
                <FileText className="size-10 text-muted-foreground" />
                <p className="mt-4 font-semibold">No note generated yet</p>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Add encounter context, select a template, then generate a
                  mock SOAP note with suggested E/M codes.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>History / past notes</CardTitle>
            <CardDescription>
              Recent mock notes available for review and editing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastNotes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className="whitespace-nowrap font-medium">
                      {note.date}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{note.patient}</div>
                      <div className="text-xs text-muted-foreground">
                        {note.type}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[220px] text-muted-foreground">
                      {note.summary}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        View / Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
        <CheckCircle2 className="mr-2 inline size-4 text-emerald-500" />
        Placeholder integrations are isolated: browser speech-to-text,
        OpenAI/Anthropic note generation, EHR copy/save, file parsing, and
        patient search can be connected without redesigning the UI.
      </div>
    </div>
  );
}
