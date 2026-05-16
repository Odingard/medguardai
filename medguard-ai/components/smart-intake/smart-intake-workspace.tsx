"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Edit,
  Eye,
  FilePlus,
  FileText,
  Loader2,
  Search,
  Send,
  Sparkles,
  User,
  Wand2,
  Zap,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { mockPatients } from "@/lib/clinical-notes/data";
import {
  autoFillFromHistory,
  buildSmartTemplate,
  completedIntakes,
  detectRedFlags,
  generateDraftClinicalNoteLink,
  getTemplateDefaults,
  intakeTemplates,
  smartIntakeStats,
  summarizeIntake,
  type IntakeField,
  type IntakeFormValues,
  type IntakeTemplate,
} from "@/lib/smart-intake/data";
import { cn } from "@/lib/utils";

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function shouldShowField(field: IntakeField, values: IntakeFormValues) {
  if (!field.showWhen) {
    return true;
  }

  return values[field.showWhen.fieldId] === field.showWhen.equals;
}

export function SmartIntakeWorkspace() {
  const [templates, setTemplates] = useState<IntakeTemplate[]>(intakeTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    intakeTemplates[0].id,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState(mockPatients[0].id);
  const [builderPrompt, setBuilderPrompt] = useState(
    "Create intake for new diabetic patient",
  );
  const [builderOpen, setBuilderOpen] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [submissionSummary, setSubmissionSummary] = useState("");
  const [portalMessage, setPortalMessage] = useState("");

  const selectedTemplate = useMemo(
    () =>
      templates.find((template) => template.id === selectedTemplateId) ??
      templates[0],
    [selectedTemplateId, templates],
  );

  const selectedPatient = useMemo(
    () =>
      mockPatients.find((patient) => patient.id === selectedPatientId) ??
      mockPatients[0],
    [selectedPatientId],
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

  const form = useForm<IntakeFormValues>({
    defaultValues: getTemplateDefaults(selectedTemplate),
  });

  const values = useWatch({ control: form.control }) as IntakeFormValues;
  const visibleFields = selectedTemplate.fields.filter((field) =>
    shouldShowField(field, values),
  );
  const redFlags = detectRedFlags(values);

  useEffect(() => {
    form.reset(getTemplateDefaults(selectedTemplate));
    setSubmissionSummary("");
    setPortalMessage("");
  }, [form, selectedTemplate]);

  async function handleSmartBuilder() {
    setIsBuilding(true);
    await wait(700);

    const generatedTemplate = buildSmartTemplate(builderPrompt);
    setTemplates((current) => [
      generatedTemplate,
      ...current.filter((template) => template.id !== generatedTemplate.id),
    ]);
    setSelectedTemplateId(generatedTemplate.id);
    setBuilderOpen(false);
    setIsBuilding(false);
  }

  async function handleAutoFill() {
    setIsAutofilling(true);
    await wait(500);

    const historyValues = autoFillFromHistory(selectedPatient.name);
    Object.entries(historyValues).forEach(([key, value]) => {
      form.setValue(key, value);
    });
    setIsAutofilling(false);
  }

  function handleSubmit(valuesToSubmit: IntakeFormValues) {
    setSubmissionSummary(summarizeIntake(valuesToSubmit));
    setPortalMessage("");
  }

  function renderField(field: IntakeField) {
    return (
      <FormField
        key={field.id}
        control={form.control}
        name={field.id}
        rules={{
          required: field.required ? `${field.label} is required` : false,
        }}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>{field.label}</FormLabel>
            <FormControl>
              {field.type === "select" ? (
                <Select
                  value={String(formField.value ?? "")}
                  onValueChange={formField.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an answer" />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === "checkbox" ? (
                <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                  <Checkbox
                    checked={Boolean(formField.value)}
                    onCheckedChange={formField.onChange}
                  />
                  <span className="text-sm text-muted-foreground">
                    Mark confirmed
                  </span>
                </div>
              ) : field.type === "textarea" ? (
                <Textarea
                  {...formField}
                  value={String(formField.value ?? "")}
                  placeholder={field.placeholder}
                  className="min-h-24"
                />
              ) : (
                <Input
                  {...formField}
                  value={String(formField.value ?? "")}
                  type={field.type === "date" ? "date" : "text"}
                  placeholder={field.placeholder}
                />
              )}
            </FormControl>
            {field.showWhen ? (
              <FormDescription>
                Conditional field shown when {field.showWhen.fieldId} equals{" "}
                {String(field.showWhen.equals)}.
              </FormDescription>
            ) : null}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="border-primary/20 bg-[linear-gradient(135deg,_hsl(var(--card)),_hsl(var(--secondary)))]">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="success">Intake to note automation</Badge>
              <Badge variant="outline">React Hook Form renderer</Badge>
            </div>
            <CardTitle className="text-3xl">
              Smart forms that auto-draft clinical notes.
            </CardTitle>
            <CardDescription className="max-w-3xl text-base leading-7">
              Search templates, generate custom intakes with AI, fill them live,
              detect red flags, and hand off structured answers to Clinical
              Notes.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {smartIntakeStats.map((stat) => {
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
            <div className="flex items-center gap-2">
              <User className="size-5 text-primary" />
              <CardTitle>Patient selector</CardTitle>
            </div>
            <CardDescription>
              Reuses the same mock patient pool as Clinical Notes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {mockPatients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} - {patient.reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="rounded-xl border bg-muted/40 p-4 text-sm">
              <p className="font-semibold">{selectedPatient.name}</p>
              <p className="mt-1 text-muted-foreground">
                Age {selectedPatient.age} · Last visit{" "}
                {selectedPatient.lastVisit}
              </p>
              <p className="mt-1 text-muted-foreground">
                Reason: {selectedPatient.reason}
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleAutoFill}
              disabled={isAutofilling}
            >
              {isAutofilling ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Zap />
              )}
              Auto-fill from History
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FilePlus className="size-5 text-primary" />
              <CardTitle>Form builder / new intake</CardTitle>
            </div>
            <CardDescription>
              Search a template library or create a custom intake from plain
              language.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search templates by visit type, specialty, or category..."
                className="pl-9"
              />
            </div>

            <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Wand2 />
                  AI Smart Builder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a custom intake</DialogTitle>
                  <DialogDescription>
                    Describe the form in plain language. The MVP generates a
                    realistic mock schema that can later call an LLM.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="builder-prompt">Form description</Label>
                  <Textarea
                    id="builder-prompt"
                    value={builderPrompt}
                    onChange={(event) => setBuilderPrompt(event.target.value)}
                    className="min-h-28"
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleSmartBuilder} disabled={isBuilding}>
                    {isBuilding ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Sparkles />
                    )}
                    Generate fields
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="space-y-3">
              {filteredTemplates.map((template) => {
                const Icon = template.icon;
                const active = template.id === selectedTemplate.id;

                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={cn(
                      "w-full rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-secondary/50",
                      active && "border-primary bg-secondary",
                    )}
                  >
                    <div className="flex items-start gap-3">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>{selectedTemplate.title}</CardTitle>
                <CardDescription>{selectedTemplate.description}</CardDescription>
              </div>
              <Badge variant="success">{visibleFields.length} active fields</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-5"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  {visibleFields.map(renderField)}
                </div>

                {redFlags.length ? (
                  <Alert variant="warning">
                    <AlertCircle className="size-4" />
                    <AlertTitle>Red-flag AI alerts</AlertTitle>
                    <AlertDescription>
                      <ul className="list-inside list-disc space-y-1">
                        {redFlags.map((flag) => (
                          <li key={flag}>{flag}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="success">
                    <CheckCircle2 className="size-4" />
                    <AlertTitle>No red flags detected</AlertTitle>
                    <AlertDescription>
                      The mock detector is watching responses for urgent
                      symptom language and specialty safety concerns.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button type="submit">
                    <ClipboardCheck />
                    Submit Intake
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset(getTemplateDefaults(selectedTemplate));
                      setSubmissionSummary("");
                      setPortalMessage("");
                    }}
                  >
                    Reset form
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Live form preview</CardTitle>
            <CardDescription>
              Real-time view of the patient-facing intake experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border bg-background p-4">
              <div className="border-b pb-3">
                <p className="font-semibold">{selectedTemplate.title}</p>
                <p className="text-sm text-muted-foreground">
                  Patient: {selectedPatient.name}
                </p>
              </div>
              <div className="mt-4 space-y-3">
                {visibleFields.map((field) => (
                  <div key={field.id} className="rounded-lg bg-muted/40 p-3">
                    <p className="text-sm font-medium">{field.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {String(values[field.id] || "Awaiting response")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Send className="size-5 text-primary" />
              <CardTitle>Post-submission actions</CardTitle>
            </div>
            <CardDescription>
              Intake becomes chart-ready work instead of another admin task.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {submissionSummary ? (
              <Alert variant="success">
                <CheckCircle2 className="size-4" />
                <AlertTitle>Intake submitted</AlertTitle>
                <AlertDescription>{submissionSummary}</AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <FileText className="size-4" />
                <AlertTitle>Waiting for submission</AlertTitle>
                <AlertDescription>
                  Submit the intake to unlock draft note generation, chart save,
                  and portal-send actions.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              <Button asChild variant="outline" disabled={!submissionSummary}>
                <Link href={generateDraftClinicalNoteLink()}>
                  <FileText />
                  Generate Note
                </Link>
              </Button>
              <Button
                variant="outline"
                disabled={!submissionSummary}
                onClick={() =>
                  setPortalMessage(
                    `Saved intake responses to ${selectedPatient.name}'s mock record.`,
                  )
                }
              >
                <ClipboardCheck />
                Save Record
              </Button>
              <Button
                variant="outline"
                disabled={!submissionSummary}
                onClick={() =>
                  setPortalMessage("Sent mock intake packet to patient portal.")
                }
              >
                <Send />
                Send Portal
              </Button>
            </div>

            {portalMessage ? (
              <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                {portalMessage}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>History / completed intakes</CardTitle>
          <CardDescription>
            Recent submissions with downstream actions for PDF review, edits,
            and Clinical Notes handoff.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Form type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedIntakes.map((intake) => (
                <TableRow key={intake.id}>
                  <TableCell className="font-medium">{intake.patient}</TableCell>
                  <TableCell>{intake.date}</TableCell>
                  <TableCell>{intake.formType}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{intake.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline">
                        <Eye />
                        View PDF
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit />
                        Edit
                      </Button>
                      <Button size="sm" asChild>
                        <Link href="/dashboard/clinical-notes">
                          <FileText />
                          Generate Note
                        </Link>
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
