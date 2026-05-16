"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { dashboardNavigation } from "@/lib/dashboard/navigation";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r bg-card/80 backdrop-blur lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 border-b px-6">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <ShieldCheck className="size-6" />
        </span>
        <div>
          <p className="text-lg font-semibold tracking-tight">MedGuard AI</p>
          <p className="text-xs text-muted-foreground">Practice command center</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-2 p-4">
        {dashboardNavigation.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-primary text-primary-foreground shadow-sm",
                "featured" in item && item.featured &&
                  !isActive &&
                  "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200",
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="size-4" />
                {item.title}
              </span>
              {item.featured ? (
                <Badge
                  variant={isActive ? "secondary" : "success"}
                  className="text-[10px]"
                >
                  Focus
                </Badge>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="m-4 rounded-2xl border bg-secondary/70 p-4">
        <p className="text-sm font-semibold">Cyber Hygiene spotlight</p>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Track security posture, risky inboxes, device readiness, and practical
          remediation tasks for small practices.
        </p>
      </div>
    </aside>
  );
}
