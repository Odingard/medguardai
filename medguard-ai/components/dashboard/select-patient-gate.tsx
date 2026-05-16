"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SelectPatientGate() {
  return (
    <div className="flex min-h-[55vh] items-center justify-center">
      <Card className="max-w-xl border-primary/20 text-center">
        <CardHeader>
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <UserRound className="size-7" />
          </div>
          <CardTitle>Select a Patient to Begin</CardTitle>
          <CardDescription>
            MedGuard works best as a patient chart. Choose a patient to unlock
            Clinical Notes, Smart Intake, Legal Documents, Cyber Hygiene, and
            Data Migration in that patient context.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/patients">Open Patients</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
