import {
  ClipboardCheck,
  DatabaseZap,
  FileHeart,
  FileText,
  CreditCard,
  LayoutDashboard,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

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
    title: "Clinical Notes",
    href: "/dashboard/clinical-notes",
    icon: FileHeart,
    featured: false,
  },
  {
    title: "Smart Intake",
    href: "/dashboard/smart-intake",
    icon: ClipboardCheck,
    featured: false,
  },
  {
    title: "Legal Documents",
    href: "/dashboard/legal-documents",
    icon: FileText,
    featured: false,
  },
  {
    title: "Cyber Hygiene",
    href: "/dashboard/cyber-hygiene",
    icon: ShieldCheck,
    featured: true,
  },
  {
    title: "Data Migration",
    href: "/dashboard/data-migration",
    icon: DatabaseZap,
    featured: false,
  },
  {
    title: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
    featured: false,
  },
] as const;
