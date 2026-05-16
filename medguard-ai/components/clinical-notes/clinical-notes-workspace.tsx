"use client";

import { useMemo, useState } from "react";
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
  generateMockSoapNote,
  mockCopyToEhr,
  mockPatients,
  mockSaveNoteToPatientRecord,
  pastNotes,
  transcriptionSegments,
  type MockPatient,
  type NoteMode,
  type SoapNote,
} from "@/lib/clinical-notes/data";
import { cn } from "@/lib/utils";

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

const selectClassName =
  "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ClinicalNotesWorkspace() {
  const [patients, setPatients] = useState<MockPatient[]>(mockPatients);
  const [selectedPatientId, setSelectedPatientId] = useState(mockPatients[0].id);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    clinicalTemplates[0].id,
  );
  const [mode, setMode] = useState<NoteMode>("voice");
  const [encounterInput, setEncounterInput] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Select a patient and start with voice, text, upload, or a template.",
  );
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientReason, setNewPatientReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [soapNote, setSoapNote] = useState<SoapNote | null>(null);

  const selectedPatient = useMemo(
    () =>
      patients.find((patient) => patient.id === selectedPatientId) ??
      patients[0],
    [patients, selectedPatientId],
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
    setStatusMessage("Requesting browser microphone and transcribing...");

    try {
      const stream = await navigator.mediaDevices?.getUserMedia?.({
        audio: true,
      });
      stream?.getTracks().forEach((track) => track.stop());
    } catch {
      setStatusMessage(
        "Microphone permission was not granted, so MedGuard is showing a realistic transcription simulation.",
      );
    }

    let transcript = "";
    for (const segment of transcriptionSegments) {
      transcript = `${transcript}${transcript ? " " : ""}${segment}`;
      setEncounterInput(transcript);
      await wait(650);
    }

    setIsTranscribing(false);
    setStatusMessage(
      "Transcription simulation complete. Review the text, then generate the SOAP note.",
    );
  }

  async function handleGenerateNote() {
    setIsGenerating(true);
    setStatusMessage("Generating mock SOAP note and suggested E/M codes...");
    await wait(750);

    setSoapNote(
      generateMockSoapNote({
        patient: selectedPatient,
        template: selectedTemplate,
        input: encounterInput,
      }),
    );
    setIsGenerating(false);
    setStatusMessage(
      "SOAP note generated. Edit any section, copy to EHR, or save to the mock patient record.",
    );
  }

  async function handleCopyToEhr() {
    if (soapNote && navigator.clipboard) {
      await navigator.clipboard.writeText(buildPlainTextSoap(soapNote));
    }

    setStatusMessage(mockCopyToEhr());
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

    setPatients((current) => [patient, ...current]);
    setSelectedPatientId(patient.id);
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
              <Badge variant="outline">Mock AI ready for LLM integration</Badge>
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
          <CardContent className="grid gap-4 sm:grid-cols-2">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient selector</CardTitle>
            <CardDescription>
              Choose a mock patient record for note generation and saving.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <select
                id="patient"
                value={selectedPatientId}
                onChange={(event) => setSelectedPatientId(event.target.value)}
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

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleGenerateNote} disabled={isGenerating}>
                {isGenerating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Sparkles />
                )}
                Generate SOAP Note
              </Button>
              <p className="text-sm text-muted-foreground">{statusMessage}</p>
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
                <div className="rounded-xl border bg-muted/40 p-4">
                  <p className="text-sm font-semibold">Suggested billing codes</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {soapNote.billingCodes.map((code) => (
                      <Badge key={code} variant="outline">
                        {code}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleCopyToEhr}>
                    <ClipboardCopy />
                    Copy to EHR
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
