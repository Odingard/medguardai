import {
  ClipboardCheck,
  CreditCard,
  DatabaseZap,
  FileHeart,
  FileText,
  Copy,
  LayoutDashboard,
  ShieldCheck,
  UsersRound,
  Clock,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Global sidebar – practice-level navigation (always visible)       */
/* ------------------------------------------------------------------ */
export const dashboardNavigation = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    featured: false,
  },
  {
    title: "Patients",
    href: "/dashboard/patients",
    icon: UsersRound,
    featured: false,
  },
  {
    title: "Cyber Hygiene",
    href: "/dashboard/cyber-hygiene",
    icon: ShieldCheck,
    featured: true,
  },
  {
    title: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
    featured: false,
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Patient workspace tabs – shown inside the patient workspace only  */
/* ------------------------------------------------------------------ */
export const patientWorkspaceTabs = [
  {
    title: "Visit Prep",
    key: "visit-prep",
    icon: Clock,
  },
  {
    title: "Clinical Notes",
    key: "clinical-notes",
    icon: FileHeart,
  },
  {
    title: "Smart Intake",
    key: "smart-intake",
    icon: ClipboardCheck,
  },
  {
    title: "Legal Documents",
    key: "legal-docs",
    icon: FileText,
  },
  {
    title: "Data Migration",
    key: "data-migration",
    icon: DatabaseZap,
  },
  {
    title: "EHR Push",
    key: "ehr-push",
    icon: Copy,
  },
] as const;
