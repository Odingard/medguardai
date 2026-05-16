"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ClipboardCheck,
  Copy,
  DatabaseZap,
  FileHeart,
  FileText,
  Grid2X2,
  List,
  Search,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  buildPlainTextSoap,
  clinicalTemplates,
  generateMockSoapNote,
  type MockPatient,
} from "@/lib/clinical-notes/data";
import {
  getPatientCommandMetrics,
  getRiskBadgeClass,
} from "@/lib/patients/command-center";
import { usePatientStore } from "@/lib/stores/patientStore";
import { useSubscriptionStore } from "@/lib/stores/subscriptionStore";
import { cn } from "@/lib/utils";

type ViewMode = "table" | "cards";
type FilterMode = "all" | "active" | "last-visit" | "risk";

const moduleActions = [
  {
    label: "Open Clinical Notes",
    href: "/dashboard/clinical-notes",
    icon: FileHeart,
    action: "clinical" as const,
  },
  {
    label: "New Smart Intake",
    href: "/dashboard/smart-intake",
    icon: ClipboardCheck,
    action: "intake" as const,
  },
  {
    label: "Generate Legal Document",
    href: "/dashboard/legal-documents",
    icon: FileText,
    action: "legal" as const,
  },
  {
    label: "View Cyber Profile",
    href: "/dashboard/cyber-hygiene",
    icon: ShieldCheck,
    action: "cyber" as const,
  },
  {
    label: "Migrate More Data",
    href: "/dashboard/data-migration",
    icon: DatabaseZap,
    action: "migration" as const,
  },
] as const;

export function PatientDirectory() {
  const router = useRouter();
  const {
    patients,
    currentPatientId,
    recentPatientIds,
    setCurrentPatient,
    prepareClinicalNoteHandoff,
  } = usePatientStore();
  const hasTeamSharing = useSubscriptionStore((state) =>
    state.hasFeature("teamSharing"),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [profilePatient, setProfilePatient] = useState<MockPatient | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    "Select a patient to make them the active context across MedGuard.",
  );

  const recentPatients = useMemo(
    () =>
      recentPatientIds.flatMap((patientId) => {
        const patient = patients.find(
          (currentPatient) => currentPatient.id === patientId,
        );
        return patient ? [patient] : [];
      }),
    [patients, recentPatientIds],
  );

  const visiblePatients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let nextPatients = patients.filter((patient) => {
      if (filterMode === "active" && patient.id !== currentPatientId) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [patient.name, patient.reason, patient.dob, patient.lastVisit]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });

    if (filterMode === "last-visit") {
      nextPatients = [...nextPatients].sort((a, b) =>
        getPatientCommandMetrics(a).lastActivity.localeCompare(
          getPatientCommandMetrics(b).lastActivity,
        ),
      );
    }

    if (filterMode === "risk") {
      const riskRank = { High: 0, Medium: 1, Low: 2 };
      nextPatients = [...nextPatients].sort(
        (a, b) =>
          riskRank[getPatientCommandMetrics(a).cyberRisk] -
          riskRank[getPatientCommandMetrics(b).cyberRisk],
      );
    }

    return nextPatients;
  }, [currentPatientId, filterMode, patients, searchQuery]);

  function setAsCurrentPatient(patient: MockPatient) {
    setCurrentPatient(patient.id);
    setStatusMessage(`${patient.name} is now the current patient.`);
  }

  function openProfile(patient: MockPatient) {
    setAsCurrentPatient(patient);
    router.push(`/dashboard/patients/${patient.id}`);
  }

  function togglePatientSelection(patientId: string, checked: boolean) {
    setSelectedPatientIds((current) =>
      checked
        ? Array.from(new Set([...current, patientId]))
        : current.filter((id) => id !== patientId),
    );
  }

  function prepareVisitPrepHandoff(patient: MockPatient) {
    const metrics = getPatientCommandMetrics(patient);
    const prep = metrics.visitPrep;

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

  function preparePatientAction(patient: MockPatient, action: string) {
    setCurrentPatient(patient.id);

    if (action === "clinical") {
      prepareVisitPrepHandoff(patient);
    }
  }

  async function pushLatestNoteToEhr(patient: MockPatient) {
    setAsCurrentPatient(patient);
    const note = generateMockSoapNote({
      patient,
      template: clinicalTemplates[0],
      input: `Latest patient context from the Patient Directory. Reason: ${patient.reason}. Last visit: ${patient.lastVisit}.`,
    });
    const formatted = buildPlainTextSoap(note);

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(formatted);
      setStatusMessage(
        `Latest SOAP note for ${patient.name} copied for Chrome Extension / EHR Push.`,
      );
    } else {
      setStatusMessage(
        `Latest SOAP note for ${patient.name} is ready for EHR Push simulation.`,
      );
    }
  }

  function renderQuickActions(patient: MockPatient, compact = false) {
    return (
      <div className={cn("flex flex-wrap gap-2", compact && "justify-end")}>
        <Button
          variant={patient.id === currentPatientId ? "default" : "outline"}
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            setAsCurrentPatient(patient);
          }}
        >
          <ShieldCheck />
          Set Current
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
          onClick={(event) => {
            event.stopPropagation();
            setAsCurrentPatient(patient);
          }}
        >
          <Link href={`/dashboard/patients/${patient.id}`}>
            <UserRound />
            View Profile
          </Link>
        </Button>
        {moduleActions.map((action) => {
          const Icon = action.icon;

          return (
            <Button
              key={action.href}
              variant="outline"
              size="sm"
              asChild
              onClick={(event) => {
                event.stopPropagation();
                preparePatientAction(patient, action.action);
              }}
            >
              <Link href={action.href}>
                <Icon />
                {action.label}
              </Link>
            </Button>
          );
        })}
        <Button
          variant="outline"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            pushLatestNoteToEhr(patient);
          }}
        >
          <Copy />
          Push Latest Note to EHR
        </Button>
      </div>
    );
  }

  function renderProfileDialog() {
    if (!profilePatient) {
      return null;
    }

    const metrics = getPatientCommandMetrics(profilePatient);

    return (
      <Dialog
        open={Boolean(profilePatient)}
        onOpenChange={(open) => {
          if (!open) {
            setProfilePatient(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start gap-4 pr-8">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <UserRound className="size-8" />
              </span>
              <div>
                <DialogTitle>{profilePatient.name}</DialogTitle>
                <DialogDescription>
                  DOB {profilePatient.dob} · Age {profilePatient.age} · {profilePatient.reason}
                </DialogDescription>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline" className={getRiskBadgeClass(metrics.cyberRisk)}>
                    Cyber Risk: {metrics.cyberRisk} ({metrics.cyberScore})
                  </Badge>
                  <Badge variant="outline">{metrics.notesCount} notes</Badge>
                  <Badge variant={metrics.intakePending ? "secondary" : "success"}>
                    {metrics.intakePending ? "Intake pending" : "Intake complete"}
                  </Badge>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
            <Card>
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
                <CardDescription>Shared mock patient profile.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p><span className="font-medium">Name:</span> {profilePatient.name}</p>
                <p><span className="font-medium">DOB:</span> {profilePatient.dob}</p>
                <p><span className="font-medium">Last visit:</span> {profilePatient.lastVisit}</p>
                <p><span className="font-medium">Current reason:</span> {profilePatient.reason}</p>
                <div className="rounded-xl border bg-muted/40 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">Visit Prep</p>
                    <Button size="sm" asChild onClick={() => prepareVisitPrepHandoff(profilePatient)}>
                      <Link href="/dashboard/clinical-notes">Start Visit</Link>
                    </Button>
                  </div>
                  <p className="mt-1 text-muted-foreground">{metrics.visitPrep.summary}</p>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <div>
                      <p className="font-medium">Medications / Allergies</p>
                      <p className="text-muted-foreground">{metrics.visitPrep.medications.join(", ")} · {metrics.visitPrep.allergies.join(", ")}</p>
                    </div>
                    <div>
                      <p className="font-medium">Talking points</p>
                      <p className="text-muted-foreground">{metrics.visitPrep.talkingPoints.join("; ")}</p>
                    </div>
                    <div>
                      <p className="font-medium">Pending</p>
                      <p className="text-muted-foreground">{metrics.visitPrep.pendingItems.join("; ")}</p>
                    </div>
                    <div>
                      <p className="font-medium">Cyber/compliance</p>
                      <p className="text-muted-foreground">{metrics.visitPrep.cyberComplianceFlags.join("; ")}</p>
                    </div>
                  </div>
                </div>
                {renderQuickActions(profilePatient)}
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
                      onClick={() => preparePatientAction(profilePatient, "clinical")}
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
                  <CardTitle>Recent Intakes & Legal Documents</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    {metrics.recentIntakes.map((intake) => (
                      <Link
                        key={intake.id}
                        href="/dashboard/smart-intake"
                        onClick={() => setCurrentPatient(profilePatient.id)}
                        className="block rounded-lg border p-3 text-sm hover:bg-muted/50"
                      >
                        <p className="font-medium">{intake.title}</p>
                        <p className="text-muted-foreground">{intake.status} · {intake.date}</p>
                      </Link>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {metrics.legalDocuments.map((document) => (
                      <Link
                        key={document.id}
                        href="/dashboard/legal-documents"
                        onClick={() => setCurrentPatient(profilePatient.id)}
                        className="block rounded-lg border p-3 text-sm hover:bg-muted/50"
                      >
                        <p className="font-medium">{document.title}</p>
                        <p className="text-muted-foreground">{document.status} · {document.date}</p>
                      </Link>
                    ))}
                  </div>
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
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-[linear-gradient(135deg,_hsl(var(--card)),_hsl(var(--secondary)))]">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="success">Patient command center</Badge>
            <Badge variant="outline">{patients.length} mock patients</Badge>
            <Badge variant="outline">{selectedPatientIds.length} selected</Badge>
          </div>
          <CardTitle className="text-3xl">
            The central command center for every patient workflow.
          </CardTitle>
          <CardDescription className="max-w-3xl text-base leading-7">
            Search, filter, set the current patient, launch module handoffs, review
            risk, and simulate EHR Push from one fast workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentPatients.length ? (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Recent patients:
              </span>
              {recentPatients.map((patient) => (
                <Button
                  key={patient.id}
                  variant={patient.id === currentPatientId ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAsCurrentPatient(patient)}
                >
                  {patient.name}
                </Button>
              ))}
            </div>
          ) : null}

          <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by patient, DOB, reason, last visit..."
                className="pl-9"
              />
            </div>
            <Select value={filterMode} onValueChange={(value) => setFilterMode(value as FilterMode)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All patients</SelectItem>
                <SelectItem value="active">Active patient</SelectItem>
                <SelectItem value="last-visit">By last visit</SelectItem>
                <SelectItem value="risk">Risk level</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                onClick={() => setViewMode("table")}
              >
                <List />
                Table
              </Button>
              <Button
                variant={viewMode === "cards" ? "default" : "outline"}
                onClick={() => setViewMode("cards")}
              >
                <Grid2X2 />
                Cards
              </Button>
            </div>
          </div>
          <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
            {statusMessage}
          </p>
        </CardContent>
      </Card>

      <Card className={hasTeamSharing ? "border-emerald-300 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/20" : "border-amber-300 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/20"}>
        <CardHeader>
          <CardTitle>Bulk Actions {hasTeamSharing ? "Unlocked" : "Locked"}</CardTitle>
          <CardDescription>
            Select multiple patients to run bulk intake packets, bulk legal documents,
            or team workflows. SMB / Group unlocks production bulk actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {hasTeamSharing ? (
            <>
              <Button
                disabled={!selectedPatientIds.length}
                onClick={() =>
                  setStatusMessage(`Bulk intake queued for ${selectedPatientIds.length} patients.`)
                }
              >
                Bulk intake
              </Button>
              <Button
                variant="outline"
                disabled={!selectedPatientIds.length}
                onClick={() =>
                  setStatusMessage(
                    `Bulk document generation queued for ${selectedPatientIds.length} patients.`,
                  )
                }
              >
                Bulk document generation
              </Button>
              <Button
                variant="outline"
                disabled={!selectedPatientIds.length}
                onClick={() =>
                  setStatusMessage(`Team assignment opened for ${selectedPatientIds.length} patients.`)
                }
              >
                Team assignment
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/dashboard/billing">Upgrade to SMB</Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {viewMode === "table" ? (
        <Card>
          <CardHeader>
            <CardTitle>Patient table</CardTitle>
            <CardDescription>
              Click a row to set the current patient and open their profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">Select</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>DOB</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Notes Count</TableHead>
                  <TableHead>Intake Pending</TableHead>
                  <TableHead>Cyber Risk</TableHead>
                  <TableHead className="text-right">Quick Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visiblePatients.map((patient) => {
                  const metrics = getPatientCommandMetrics(patient);
                  const active = patient.id === currentPatientId;

                  return (
                    <TableRow
                      key={patient.id}
                      className={cn("cursor-pointer", active && "bg-secondary/60")}
                      onClick={() => openProfile(patient)}
                    >
                      <TableCell onClick={(event) => event.stopPropagation()}>
                        <Checkbox
                          checked={selectedPatientIds.includes(patient.id)}
                          onCheckedChange={(checked) =>
                            togglePatientSelection(patient.id, Boolean(checked))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-xs text-muted-foreground">{patient.reason}</div>
                      </TableCell>
                      <TableCell>{patient.dob}</TableCell>
                      <TableCell>{patient.lastVisit}</TableCell>
                      <TableCell>{metrics.notesCount}</TableCell>
                      <TableCell>
                        <Badge variant={metrics.intakePending ? "secondary" : "success"}>
                          {metrics.intakePending ? "Pending" : "Clear"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRiskBadgeClass(metrics.cyberRisk)}>
                          {metrics.cyberRisk} · {metrics.cyberScore}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(event) => event.stopPropagation()}>
                        {renderQuickActions(patient, true)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {visiblePatients.map((patient) => {
            const metrics = getPatientCommandMetrics(patient);
            const active = patient.id === currentPatientId;

            return (
              <Card
                key={patient.id}
                className={active ? "border-primary bg-secondary/50" : undefined}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <UserRound className="size-5" />
                      </span>
                      <div>
                        <CardTitle>{patient.name}</CardTitle>
                        <CardDescription>
                          Age {patient.age} · DOB {patient.dob}
                        </CardDescription>
                      </div>
                    </div>
                    {active ? <Badge variant="success">Current</Badge> : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 rounded-xl border bg-card p-4 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-muted-foreground">Notes</p>
                      <p className="text-xl font-semibold">{metrics.notesCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Intake</p>
                      <p className="font-semibold">{metrics.intakePending ? "Pending" : "Clear"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cyber</p>
                      <Badge variant="outline" className={getRiskBadgeClass(metrics.cyberRisk)}>
                        {metrics.cyberRisk}
                      </Badge>
                    </div>
                  </div>
                  {renderQuickActions(patient)}
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}

      {renderProfileDialog()}
    </div>
  );
}
