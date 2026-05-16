"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  DatabaseZap,
  FileHeart,
  FileText,
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
import { Input } from "@/components/ui/input";
import { usePatientStore } from "@/lib/stores/patientStore";

const patientModuleLinks = [
  {
    label: "Clinical Notes",
    href: "/dashboard/clinical-notes",
    icon: FileHeart,
  },
  {
    label: "Smart Intake",
    href: "/dashboard/smart-intake",
    icon: ClipboardCheck,
  },
  {
    label: "Legal Documents",
    href: "/dashboard/legal-documents",
    icon: FileText,
  },
  {
    label: "Data Migration",
    href: "/dashboard/data-migration",
    icon: DatabaseZap,
  },
] as const;

export function PatientDirectory() {
  const { patients, currentPatientId, recentPatientIds, setCurrentPatient } =
    usePatientStore();
  const [searchQuery, setSearchQuery] = useState("");

  const recentPatients = useMemo(
    () =>
      recentPatientIds.flatMap((patientId) => {
        const patient = patients.find((currentPatient) => currentPatient.id === patientId);
        return patient ? [patient] : [];
      }),
    [patients, recentPatientIds],
  );

  const filteredPatients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return patients;
    }

    return patients.filter((patient) =>
      [patient.name, patient.reason, patient.dob, patient.lastVisit]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [patients, searchQuery]);

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-[linear-gradient(135deg,_hsl(var(--card)),_hsl(var(--secondary)))]">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="success">Shared patient context</Badge>
            <Badge variant="outline">{patients.length} mock patients</Badge>
          </div>
          <CardTitle className="text-3xl">
            One patient directory across every MedGuard module.
          </CardTitle>
          <CardDescription className="max-w-3xl text-base leading-7">
            Search patients, set the active patient, and jump into notes,
            intake, legal documents, or migration review with the same shared
            mock record.
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
                  onClick={() => setCurrentPatient(patient.id)}
                >
                  {patient.name}
                </Button>
              ))}
            </div>
          ) : null}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by patient, reason, DOB, or last visit..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        {filteredPatients.map((patient) => {
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
                  {active ? <Badge variant="success">Active</Badge> : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border bg-card p-4 text-sm">
                  <p className="font-medium">{patient.reason}</p>
                  <p className="mt-1 text-muted-foreground">
                    Last visit: {patient.lastVisit}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={active ? "default" : "outline"}
                    onClick={() => setCurrentPatient(patient.id)}
                  >
                    <ShieldCheck />
                    Set active patient
                  </Button>
                  {patientModuleLinks.map((link) => {
                    const Icon = link.icon;

                    return (
                      <Button
                        key={link.href}
                        variant="outline"
                        size="sm"
                        asChild
                        onClick={() => setCurrentPatient(patient.id)}
                      >
                        <Link href={link.href}>
                          <Icon />
                          {link.label}
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
