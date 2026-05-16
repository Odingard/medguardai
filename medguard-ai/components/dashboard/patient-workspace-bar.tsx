"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePatientStore } from "@/lib/stores/patientStore";

export function PatientWorkspaceBar() {
  const [storeMounted, setStoreMounted] = useState(false);
  const { patients, currentPatientId, patientWorkspaceOpen, closePatientWorkspace } =
    usePatientStore();
  const patient = patients.find((item) => item.id === currentPatientId);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setStoreMounted(true), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!storeMounted || !patientWorkspaceOpen || !patient) {
    return null;
  }

  return (
    <div className="sticky top-20 z-10 border-b bg-card/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/dashboard/patient/${patient.id}`}
          className="flex items-center gap-3"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <UserRound className="size-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{patient.name}</p>
              <Badge variant="success">Current Patient</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              DOB {patient.dob} · Last visit {patient.lastVisit}
            </p>
          </div>
        </Link>
        <Button variant="outline" asChild onClick={closePatientWorkspace}>
          <Link href="/dashboard/patients">
            <X />
            Close Patient / Back to All Patients
          </Link>
        </Button>
      </div>
    </div>
  );
}
