"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { DashboardMobileNav } from "@/components/dashboard/mobile-nav";
import { PatientWorkspaceBar } from "@/components/dashboard/patient-workspace-bar";
import { SelectPatientGate } from "@/components/dashboard/select-patient-gate";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import type { DashboardUser } from "@/lib/auth/session";
import { usePatientStore } from "@/lib/stores/patientStore";

type DashboardShellProps = {
  children: ReactNode;
  user: DashboardUser;
};

const patientRequiredRoutes = [
  "/dashboard/clinical-notes",
  "/dashboard/smart-intake",
  "/dashboard/legal-documents",
  "/dashboard/cyber-hygiene",
  "/dashboard/data-migration",
];

function routeRequiresPatient(pathname: string) {
  return patientRequiredRoutes.some((route) => pathname.startsWith(route));
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const [storeMounted, setStoreMounted] = useState(false);
  const patientWorkspaceOpen = usePatientStore(
    (state) => state.patientWorkspaceOpen,
  );
  const effectiveWorkspaceOpen = storeMounted && patientWorkspaceOpen;
  const shouldGate = routeRequiresPatient(pathname) && !effectiveWorkspaceOpen;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setStoreMounted(true), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopbar user={user} />
          <PatientWorkspaceBar />
          <DashboardMobileNav />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {shouldGate ? <SelectPatientGate /> : children}
          </main>
        </div>
      </div>
    </div>
  );
}
