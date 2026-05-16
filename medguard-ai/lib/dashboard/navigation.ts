import {
  ClipboardCheck,
  DatabaseZap,
  FileHeart,
  FileText,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";

export const dashboardNavigation = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Clinical Notes",
    href: "/dashboard/clinical-notes",
    icon: FileHeart,
  },
  {
    title: "Smart Intake",
    href: "/dashboard/smart-intake",
    icon: ClipboardCheck,
  },
  {
    title: "Legal Documents",
    href: "/dashboard/legal-documents",
    icon: FileText,
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
  },
] as const;
