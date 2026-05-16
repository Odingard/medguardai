"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Archive,
  Download,
  Eye,
  FileText,
  Loader2,
  Search,
  Send,
  Shield,
  Signature,
  Sparkles,
  Wand2,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  buildCustomLegalTemplate,
  generateLegalDocument,
  legalDocumentHistory,
  legalDocumentTemplates,
  legalModuleStats,
  mockGeneratePdf,
  mockSendDocument,
  mockSignDigitally,
  type GeneratedLegalDocument,
  type LegalDocumentStatus,
  type LegalDocumentTemplate,
} from "@/lib/legal-documents/data";
import { usePatientStore } from "@/lib/stores/patientStore";
import { cn } from "@/lib/utils";

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

const statusStyles: Record<LegalDocumentStatus, string> = {
  Draft: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
  Signed:
    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
  Sent: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300",
  Archived:
    "border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-300",
};

export function LegalDocumentsWorkspace() {
  const { patients, activePatientId, setActivePatient } = usePatientStore();
  const [templates, setTemplates] = useState<LegalDocumentTemplate[]>(
    legalDocumentTemplates,
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    legalDocumentTemplates[0].id,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [customPrompt, setCustomPrompt] = useState(
    "Create telehealth consent for new patient including photography permission",
  );
  const [builderOpen, setBuilderOpen] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] =
    useState<GeneratedLegalDocument | null>(null);
  const [patientNameField, setPatientNameField] = useState(
    patients[0]?.name ?? "",
  );
  const [dateField, setDateField] = useState("");
  const [customClausesField, setCustomClausesField] = useState("");
  const [documentBodyField, setDocumentBodyField] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    "Choose a template or generate a custom legal-medical document.",
  );

  const selectedTemplate = useMemo(
    () =>
      templates.find((template) => template.id === selectedTemplateId) ??
      templates[0],
    [selectedTemplateId, templates],
  );

  const selectedPatient = useMemo(
    () =>
      patients.find((patient) => patient.id === activePatientId) ?? patients[0],
    [patients, activePatientId],
  );

  const filteredTemplates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return templates;
    }

    return templates.filter((template) =>
      [template.title, template.category, template.description]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [searchQuery, templates]);

  function loadGeneratedDocument(document: GeneratedLegalDocument) {
    setGeneratedDocument(document);
    setPatientNameField(document.patientName);
    setDateField(document.effectiveDate);
    setCustomClausesField(document.customClauses);
    setDocumentBodyField(document.body);
  }

  async function handleGenerateDocument() {
    setIsGenerating(true);
    setStatusMessage("Generating mock legal document from selected template...");
    await wait(650);

    const document = generateLegalDocument({
      template: selectedTemplate,
      patient: selectedPatient,
      customPrompt: customClausesField,
    });
    loadGeneratedDocument(document);
    setIsGenerating(false);
    setStatusMessage(
      "Document generated. Review editable fields, generate a mock PDF, or simulate signing.",
    );
  }

  async function handleBuildCustomTemplate() {
    setIsBuilding(true);
    await wait(650);

    const customTemplate = buildCustomLegalTemplate(customPrompt);
    setTemplates((current) => [
      customTemplate,
      ...current.filter((template) => template.id !== customTemplate.id),
    ]);
    setSelectedTemplateId(customTemplate.id);
    setCustomClausesField(customPrompt);
    setBuilderOpen(false);
    setIsBuilding(false);
    setStatusMessage("AI custom template created and selected.");
  }

  function handlePatientChange(patientId: string) {
    const patient =
      patients.find((currentPatient) => currentPatient.id === patientId) ??
      patients[0];
    setActivePatient(patientId);
    setPatientNameField(patient.name);
  }

  function handleGeneratePdf() {
    const title = generatedDocument?.title ?? selectedTemplate.title;
    setStatusMessage(mockGeneratePdf(title));
  }

  function handleSignDigitally() {
    setStatusMessage(mockSignDigitally(patientNameField || selectedPatient.name));
    setGeneratedDocument((current) =>
      current ? { ...current, status: "Signed" } : current,
    );
  }

  function handleSendDocument() {
    setStatusMessage(mockSendDocument(patientNameField || selectedPatient.name));
    setGeneratedDocument((current) =>
      current ? { ...current, status: "Sent" } : current,
    );
  }

  const previewLines = documentBodyField.split("\n");

  return (
    <div className="space-y-8">
      <Alert variant="warning">
        <AlertTriangle className="size-4" />
        <AlertTitle>Legal review required</AlertTitle>
        <AlertDescription>
          Documents are templates only. Consult legal counsel for final use.
        </AlertDescription>
      </Alert>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-primary/20 bg-[linear-gradient(135deg,_hsl(var(--card)),_hsl(var(--secondary)))]">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="success">Legal-medical workflow</Badge>
              <Badge variant="outline">Mock LLM + PDF ready</Badge>
            </div>
            <CardTitle className="text-3xl">
              Generate consent and compliance templates in under 30 seconds.
            </CardTitle>
            <CardDescription className="max-w-3xl text-base leading-7">
              Start from common practice documents, tailor clauses with AI, and
              prepare patient-ready drafts for review, signature, and portal
              delivery.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            {legalModuleStats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div key={stat.label} className="rounded-xl border bg-card/80 p-4">
                  <Icon className="size-5 text-primary" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-primary" />
                <CardTitle>Current Patient</CardTitle>
              </div>
              <Badge variant="success">{selectedPatient.name}</Badge>
            </div>
            <CardDescription>
              Attach generated documents to the shared patient record used
              across intake and notes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={activePatientId} onValueChange={handlePatientChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} - {patient.reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="rounded-xl border bg-muted/40 p-4 text-sm">
              <p className="font-semibold">{selectedPatient.name}</p>
              <p className="mt-1 text-muted-foreground">
                DOB {selectedPatient.dob} · Last visit{" "}
                {selectedPatient.lastVisit}
              </p>
              <p className="mt-1 text-muted-foreground">
                Current context: {selectedPatient.reason}
              </p>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/dashboard/patients?patient=${selectedPatient.id}`}>
                View patient profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              <CardTitle>Document generator</CardTitle>
            </div>
            <CardDescription>
              Search templates or generate a tailored custom document.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search HIPAA, telehealth, Texas forms, BAA..."
                className="pl-9"
              />
            </div>

            <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Wand2 />
                  AI Custom Builder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Build a custom document</DialogTitle>
                  <DialogDescription>
                    Describe the legal-medical document. The MVP creates a mock
                    template now and can later call an LLM.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="custom-legal-prompt">Document needs</Label>
                  <Textarea
                    id="custom-legal-prompt"
                    value={customPrompt}
                    onChange={(event) => setCustomPrompt(event.target.value)}
                    className="min-h-28"
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleBuildCustomTemplate} disabled={isBuilding}>
                    {isBuilding ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Sparkles />
                    )}
                    Generate template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="grid gap-3">
              {filteredTemplates.map((template) => {
                const Icon = template.icon;
                const active = template.id === selectedTemplate.id;

                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplateId(template.id);
                      setCustomClausesField("");
                      setStatusMessage(`${template.title} selected.`);
                    }}
                    className={cn(
                      "rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-secondary/50",
                      active && "border-primary bg-secondary",
                    )}
                  >
                    <div className="flex gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{template.title}</p>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-clauses">Custom clauses or notes</Label>
              <Textarea
                id="custom-clauses"
                value={customClausesField}
                onChange={(event) => setCustomClausesField(event.target.value)}
                placeholder="Add photography permission, state-specific note, portal delivery language..."
                className="min-h-24"
              />
            </div>

            <Button
              className="w-full"
              onClick={handleGenerateDocument}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
              Generate Document
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Document preview & editor</CardTitle>
                <CardDescription>
                  Edit patient fields, custom clauses, and document body before
                  PDF/signature actions.
                </CardDescription>
              </div>
              {generatedDocument ? (
                <Badge
                  variant="outline"
                  className={statusStyles[generatedDocument.status]}
                >
                  {generatedDocument.status}
                </Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="patient-name-field">Patient / party name</Label>
                <Input
                  id="patient-name-field"
                  value={patientNameField}
                  onChange={(event) => setPatientNameField(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-field">Effective date</Label>
                <Input
                  id="date-field"
                  value={dateField}
                  onChange={(event) => setDateField(event.target.value)}
                  placeholder="May 16, 2026"
                />
              </div>
            </div>

            {generatedDocument ? (
              <>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="document-body">Editable document body</Label>
                    <Textarea
                      id="document-body"
                      value={documentBodyField}
                      onChange={(event) =>
                        setDocumentBodyField(event.target.value)
                      }
                      className="min-h-[420px] font-mono text-xs leading-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rich preview</Label>
                    <div className="min-h-[420px] rounded-xl border bg-background p-5 text-sm leading-7 shadow-inner">
                      {previewLines.map((line, index) =>
                        line ? (
                          <p
                            key={`${line}-${index}`}
                            className={
                              line === line.toUpperCase() && line.length < 40
                                ? "mt-4 font-semibold tracking-wide text-primary first:mt-0"
                                : "text-muted-foreground"
                            }
                          >
                            {line}
                          </p>
                        ) : (
                          <div key={`space-${index}`} className="h-3" />
                        ),
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleGeneratePdf}>
                    <Download />
                    Generate PDF
                  </Button>
                  <Button variant="outline" onClick={handleSignDigitally}>
                    <Signature />
                    Sign Digitally
                  </Button>
                  <Button variant="outline" onClick={handleSendDocument}>
                    <Send />
                    Send
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 p-8 text-center">
                <FileText className="size-10 text-muted-foreground" />
                <p className="mt-4 font-semibold">No document generated yet</p>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Select a template, add optional clauses, then generate a mock
                  legal document for review.
                </p>
              </div>
            )}

            <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
              {statusMessage}
            </p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Document history</CardTitle>
          <CardDescription>
            Track practice documents from draft through signature, portal send,
            download, and archive.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document type</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Date created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {legalDocumentHistory.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium">
                    {document.documentType}
                  </TableCell>
                  <TableCell>{document.patient}</TableCell>
                  <TableCell>{document.dateCreated}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusStyles[document.status]}
                    >
                      {document.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline">
                        <Eye />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download />
                        Download
                      </Button>
                      <Button size="sm" variant="outline">
                        <Send />
                        Send
                      </Button>
                      <Button size="sm" variant="outline">
                        <Archive />
                        Archive
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
