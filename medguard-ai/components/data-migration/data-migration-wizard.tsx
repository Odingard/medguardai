"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  DatabaseZap,
  Download,
  FileSearch,
  Loader2,
  Play,
  RefreshCw,
  ShieldCheck,
  Upload,
  UploadCloud,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import {
  importOptions,
  migrationHistory,
  migrationStats,
  mockDownloadReport,
  processingStages,
  sampleDetectedRecords,
  sampleFieldMappings,
  sampleMigrationIssues,
  securityAssurances,
  simulateFileAnalysis,
  simulateSecureImport,
  supportedFormats,
  type FieldMapping,
  type MigrationIssueSeverity,
  type MigrationStep,
} from "@/lib/data-migration/data";
import { usePatientStore } from "@/lib/stores/patientStore";
import { cn } from "@/lib/utils";

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

const steps: { id: MigrationStep; label: string }[] = [
  { id: "welcome", label: "Start" },
  { id: "analysis", label: "Analyze" },
  { id: "mapping", label: "Map" },
  { id: "options", label: "Import" },
  { id: "results", label: "Results" },
];

const issueStyles: Record<MigrationIssueSeverity, string> = {
  high: "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300",
  medium:
    "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
  low: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
};

function getStepIndex(step: MigrationStep) {
  return steps.findIndex((currentStep) => currentStep.id === step);
}

export function DataMigrationWizard() {
  const {
    patients,
    currentPatientId,
    addPatient,
    setCurrentPatient,
    prepareClinicalNoteHandoff,
  } = usePatientStore();
  const [currentStep, setCurrentStep] = useState<MigrationStep>("welcome");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState("Ready to upload files.");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisSummary, setAnalysisSummary] = useState(
    "Upload legacy data to start AI parsing.",
  );
  const [fieldMappings, setFieldMappings] =
    useState<FieldMapping[]>(sampleFieldMappings);
  const [selectedImportOptions, setSelectedImportOptions] = useState<string[]>(
    () =>
      importOptions
        .filter((option) => option.defaultSelected)
        .map((option) => option.id),
  );
  const [dryRun, setDryRun] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ReturnType<
    typeof simulateSecureImport
  > | null>(null);
  const [reportMessage, setReportMessage] = useState("");
  const [importedPatientIds, setImportedPatientIds] = useState<string[]>([]);

  const activeStepIndex = getStepIndex(currentStep);
  const fileCount = uploadedFiles.length || 3;
  const analysisResult = useMemo(() => simulateFileAnalysis(fileCount), [fileCount]);
  const currentPatient = useMemo(
    () =>
      patients.find((patient) => patient.id === currentPatientId) ?? patients[0],
    [patients, currentPatientId],
  );

  const importedPatients = useMemo(
    () =>
      importedPatientIds.flatMap((patientId) => {
        const patient = patients.find((current) => current.id === patientId);
        return patient ? [patient] : [];
      }),
    [importedPatientIds, patients],
  );

  function estimateAgeFromDob(dob: string) {
    const year = Number(dob.split("/")[2]);
    return Number.isFinite(year) ? Math.max(0, new Date().getFullYear() - year) : 0;
  }

  function resolveImportedPatients() {
    const resolvedIds: string[] = [];

    sampleDetectedRecords.forEach((record) => {
      const existingPatient = patients.find(
        (patient) => patient.name === record.patientName,
      );

      if (existingPatient) {
        resolvedIds.push(existingPatient.id);
        return;
      }

      const importedPatient = {
        id: `mig-${record.id}`,
        name: record.patientName,
        age: estimateAgeFromDob(record.dob),
        dob: record.dob,
        reason: `Imported legacy record from ${record.source}`,
        lastVisit: record.lastVisit,
      };
      addPatient(importedPatient);
      resolvedIds.push(importedPatient.id);
    });

    return resolvedIds;
  }

  function handleFiles(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    setUploadedFiles(Array.from(files).map((file) => file.name));
    setCurrentStep("analysis");
    setAnalysisSummary("Files staged for encrypted AI analysis.");
  }

  async function handleRunAnalysis() {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisSummary("AI analysis in progress...");

    for (let index = 0; index < processingStages.length; index += 1) {
      setAnalysisStage(processingStages[index]);
      setAnalysisProgress((index + 1) * 20);
      await wait(450);
    }

    setIsAnalyzing(false);
    setAnalysisSummary(analysisResult.summary);
    setCurrentStep("mapping");
  }

  function handleMappingChange(sourceField: string, suggestedTarget: string) {
    setFieldMappings((currentMappings) =>
      currentMappings.map((mapping) =>
        mapping.sourceField === sourceField
          ? { ...mapping, suggestedTarget }
          : mapping,
      ),
    );
  }

  function toggleImportOption(optionId: string, checked: boolean) {
    setSelectedImportOptions((currentOptions) =>
      checked
        ? Array.from(new Set([...currentOptions, optionId]))
        : currentOptions.filter((currentOption) => currentOption !== optionId),
    );
  }

  async function handleStartImport() {
    setIsImporting(true);
    setImportProgress(0);
    setImportResult(null);

    for (const progress of [20, 45, 70, 90, 100]) {
      setImportProgress(progress);
      await wait(350);
    }

    const result = simulateSecureImport({
      dryRun,
      selectedOptionCount: selectedImportOptions.length,
    });
    setImportResult(result);

    if (dryRun) {
      setImportedPatientIds([]);
    } else {
      const resolvedIds = resolveImportedPatients();
      setImportedPatientIds(resolvedIds);
      if (resolvedIds[0]) {
        setCurrentPatient(resolvedIds[0]);
      }
    }

    setIsImporting(false);
    setCurrentStep("results");
  }

  function goToNextStep() {
    const nextStep = steps[Math.min(activeStepIndex + 1, steps.length - 1)];
    setCurrentStep(nextStep.id);
  }

  function prepareClinicalNotesView(patientName: string, summary: string) {
    const patient = patients.find((currentPatient) => currentPatient.name === patientName);

    const patientId = patient?.id ?? currentPatient.id;

    setCurrentPatient(patientId);
    prepareClinicalNoteHandoff({
      patientId,
      source: "data-migration",
      prefill: [
        `Migrated record review for ${patientName}`,
        summary,
        "",
        "Review imported history and generate a concise continuity-of-care note.",
      ].join("\n"),
    });
  }

  return (
    <div className="space-y-8">
      <Alert variant="success">
        <ShieldCheck className="size-4" />
        <AlertTitle>Secure migration workspace</AlertTitle>
        <AlertDescription>
          All processing done with end-to-end encryption. HIPAA-ready
          architecture.
        </AlertDescription>
      </Alert>

      <Alert>
        <DatabaseZap className="size-4" />
        <AlertTitle>Current Patient: {currentPatient.name}</AlertTitle>
        <AlertDescription>
          Migration handoffs can open imported summaries in Clinical Notes for
          this shared patient context.
        </AlertDescription>
      </Alert>

      <Card className="border-primary/20 bg-[linear-gradient(135deg,_hsl(var(--card)),_hsl(var(--secondary)))]">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="success">Self-serve legacy data import</Badge>
            <Badge variant="outline">Vision + LLM parsing placeholder</Badge>
          </div>
          <CardTitle className="text-3xl">
            Import legacy patient data from PDFs, Excel, scans, or old EHR exports.
          </CardTitle>
          <CardDescription className="max-w-3xl text-base leading-7">
            AI will parse source files, structure patient records, suggest field
            mappings, flag issues, and simulate a safe import plan before any
            data is written.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {migrationStats.map((stat) => {
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
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-5">
            {steps.map((step, index) => {
              const complete = index < activeStepIndex;
              const active = step.id === currentStep;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-colors hover:border-primary",
                    active && "border-primary bg-secondary",
                    complete && "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{step.label}</span>
                    {complete ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {index + 1}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {currentStep === "welcome" ? (
        <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UploadCloud className="size-5 text-primary" />
                <CardTitle>Welcome / start screen</CardTitle>
              </div>
              <CardDescription>
                Bring old charts into MedGuard without turning migration into a
                services project.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl border border-dashed bg-muted/30 p-8 text-center">
                <Upload className="mx-auto size-12 text-primary" />
                <p className="mt-4 text-lg font-semibold">Upload legacy files</p>
                <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                  Multiple files supported for PDFs, Excel exports, CSVs,
                  scanned images, ZIP bundles, and basic CCD/CCDA files.
                </p>
                <Label
                  htmlFor="migration-upload"
                  className="mt-5 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                  <Upload />
                  Upload Files
                </Label>
                <Input
                  id="migration-upload"
                  type="file"
                  multiple
                  className="sr-only"
                  accept=".pdf,.xlsx,.csv,.jpg,.jpeg,.png,.xml,.zip"
                  onChange={(event) => handleFiles(event.target.files)}
                />
              </div>

              {uploadedFiles.length ? (
                <div className="rounded-xl border bg-card p-4">
                  <p className="font-semibold">Files staged</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {uploadedFiles.map((fileName) => (
                      <li key={fileName}>{fileName}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supported formats</CardTitle>
              <CardDescription>
                Designed for the messy reality of small-practice legacy data.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {supportedFormats.map((format) => {
                const Icon = format.icon;

                return (
                  <div key={format.label} className="flex gap-3 rounded-xl border bg-card p-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <p className="font-semibold">{format.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {format.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>
      ) : null}

      {currentStep === "analysis" ? (
        <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileSearch className="size-5 text-primary" />
                <CardTitle>Upload & analysis</CardTitle>
              </div>
              <CardDescription>
                Simulate OCR, vision parsing, LLM extraction, and secure
                migration planning.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div
                className="rounded-2xl border border-dashed bg-muted/30 p-8 text-center"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  handleFiles(event.dataTransfer.files);
                }}
              >
                <UploadCloud className="mx-auto size-12 text-primary" />
                <p className="mt-4 font-semibold">
                  Drag and drop legacy files here
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Or use the upload button from the start screen.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>{analysisStage}</span>
                  <span>{analysisProgress}%</span>
                </div>
                <Progress value={analysisProgress} />
                <p className="text-sm text-muted-foreground">{analysisSummary}</p>
              </div>

              <Button onClick={handleRunAnalysis} disabled={isAnalyzing}>
                {isAnalyzing ? <Loader2 className="animate-spin" /> : <Play />}
                Run AI Analysis
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detected items</CardTitle>
              <CardDescription>
                Mock findings after encrypted AI document understanding.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="rounded-xl border bg-card p-4">
                <p className="text-sm text-muted-foreground">Patients found</p>
                <p className="text-3xl font-semibold">
                  {analysisResult.patientsFound}
                </p>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <p className="text-sm text-muted-foreground">Documents</p>
                <p className="text-3xl font-semibold">
                  {analysisResult.documentsFound}
                </p>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <p className="text-sm text-muted-foreground">Records ready</p>
                <p className="text-3xl font-semibold">
                  {analysisResult.recordsReady}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : null}

      {currentStep === "mapping" ? (
        <section className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review & mapping</CardTitle>
              <CardDescription>
                Preview parsed records, edit AI-suggested mappings, and resolve
                import issues before proceeding.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Notes Summary</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleDetectedRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.patientName}
                      </TableCell>
                      <TableCell>{record.dob}</TableCell>
                      <TableCell>{record.lastVisit}</TableCell>
                      <TableCell className="min-w-[260px] text-muted-foreground">
                        {record.notesSummary}
                      </TableCell>
                      <TableCell>{record.source}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.confidence}%</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          onClick={() =>
                            prepareClinicalNotesView(
                              record.patientName,
                              record.notesSummary,
                            )
                          }
                        >
                          <Link href="/dashboard/clinical-notes">
                            View in Clinical Notes
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
                <Card>
                  <CardHeader>
                    <CardTitle>AI-suggested field mapping</CardTitle>
                    <CardDescription>
                      Editable mapping targets for imported data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {fieldMappings.map((mapping) => (
                      <div
                        key={mapping.sourceField}
                        className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_1.2fr_auto] md:items-center"
                      >
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Source field
                          </p>
                          <p className="font-medium">{mapping.sourceField}</p>
                        </div>
                        <Select
                          value={mapping.suggestedTarget}
                          onValueChange={(value) =>
                            handleMappingChange(mapping.sourceField, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "patient.name",
                              "patient.dateOfBirth",
                              "encounter.lastVisitDate",
                              "clinical.history.conditions",
                              "clinical.medications",
                              "clinical.allergies",
                              "documents.sourceFiles",
                            ].map((target) => (
                              <SelectItem key={target} value={target}>
                                {target}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Badge variant="outline">{mapping.confidence}%</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Potential issues</CardTitle>
                    <CardDescription>
                      Duplicates, missing data, and OCR confidence warnings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {sampleMigrationIssues.map((issue) => (
                      <Alert key={issue.id} variant="default">
                        <AlertTriangle className="size-4" />
                        <AlertTitle>
                          <Badge
                            variant="outline"
                            className={cn("capitalize", issueStyles[issue.severity])}
                          >
                            {issue.severity}
                          </Badge>
                        </AlertTitle>
                        <AlertDescription>
                          <p>{issue.description}</p>
                          <p className="mt-1 font-medium">
                            {issue.suggestedAction}
                          </p>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
          <Button onClick={goToNextStep}>
            Continue to import options
            <ArrowRight />
          </Button>
        </section>
      ) : null}

      {currentStep === "options" ? (
        <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DatabaseZap className="size-5 text-primary" />
                <CardTitle>Import options</CardTitle>
              </div>
              <CardDescription>
                Choose the record categories to import and whether to run a dry
                run first.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {importOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex gap-3 rounded-xl border bg-card p-4"
                >
                  <Checkbox
                    checked={selectedImportOptions.includes(option.id)}
                    onCheckedChange={(checked) =>
                      toggleImportOption(option.id, Boolean(checked))
                    }
                  />
                  <div>
                    <p className="font-semibold">{option.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex gap-3 rounded-xl border bg-secondary/60 p-4">
                <Checkbox
                  checked={dryRun}
                  onCheckedChange={(checked) => setDryRun(Boolean(checked))}
                />
                <div>
                  <p className="font-semibold">Dry Run simulation</p>
                  <p className="text-sm text-muted-foreground">
                    Validate the import plan without writing records.
                  </p>
                </div>
              </div>
              <Alert variant="warning">
                <AlertTriangle className="size-4" />
                <AlertTitle>Security checkpoint</AlertTitle>
                <AlertDescription>
                  Import simulation keeps review checkpoints before write, tracks
                  source files for auditability, and should only be connected to
                  signed BAAs and HIPAA-approved storage in production.
                </AlertDescription>
              </Alert>
              <Button onClick={handleStartImport} disabled={isImporting}>
                {isImporting ? (
                  <RefreshCw className="animate-spin" />
                ) : (
                  <ShieldCheck />
                )}
                Start Secure Import
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Import progress</CardTitle>
              <CardDescription>
                Mock secure processing state for the selected options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Progress value={importProgress} />
              <p className="text-sm text-muted-foreground">
                {isImporting
                  ? "Encrypting, validating mappings, and preparing records..."
                  : "Ready to start secure import."}
              </p>
              <div className="grid gap-3">
                {securityAssurances.map((assurance) => {
                  const Icon = assurance.icon;

                  return (
                    <div key={assurance.title} className="flex gap-3 rounded-xl border bg-card p-4">
                      <Icon className="size-5 text-primary" />
                      <div>
                        <p className="font-semibold">{assurance.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {assurance.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>
      ) : null}

      {currentStep === "results" ? (
        <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-500" />
                <CardTitle>Results</CardTitle>
              </div>
              <CardDescription>
                Success summary and downloadable migration report.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {importResult ? (
                <Alert variant="success">
                  <CheckCircle2 className="size-4" />
                  <AlertTitle>{importResult.title}</AlertTitle>
                  <AlertDescription>
                    {importResult.summary} {importResult.selectedOptionCount} import
                    categories were selected.
                  </AlertDescription>
                </Alert>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border bg-card p-4">
                  <p className="text-sm text-muted-foreground">
                    Imported patients
                  </p>
                  <p className="text-3xl font-semibold">
                    {importResult?.importedPatients ?? 0}
                  </p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                  <p className="text-sm text-muted-foreground">
                    Imported documents
                  </p>
                  <p className="text-3xl font-semibold">
                    {importResult?.importedDocuments ?? 0}
                  </p>
                </div>
              </div>
              {importedPatients.length ? (
                <div className="rounded-xl border bg-card p-4">
                  <p className="font-semibold">Imported / matched patient records</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {importedPatients.map((patient) => (
                      <div key={patient.id} className="flex flex-wrap gap-2 rounded-lg border p-2">
                        <span className="px-2 py-1 text-sm font-medium">{patient.name}</span>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/patient/${patient.id}`}>
                            View in Patients
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            prepareClinicalNotesView(
                              patient.name,
                              `Imported legacy summary for ${patient.name}. Review source records and continue the clinical note.`,
                            )
                          }
                          asChild
                        >
                          <Link href="/dashboard/clinical-notes">
                            View in Clinical Notes
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              <Button
                onClick={() => setReportMessage(mockDownloadReport())}
                variant="outline"
              >
                <Download />
                Download Report
              </Button>
              {reportMessage ? (
                <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                  {reportMessage}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Import history log</CardTitle>
              <CardDescription>
                Past migrations and review outcomes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Imported</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {migrationHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="whitespace-nowrap font-medium">
                        {entry.date}
                      </TableCell>
                      <TableCell>{entry.source}</TableCell>
                      <TableCell>{entry.imported}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setReportMessage(`Opened mock migration report for ${entry.source}.`)
                          }
                        >
                          <Download />
                          Report
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      ) : null}
    </div>
  );
}
