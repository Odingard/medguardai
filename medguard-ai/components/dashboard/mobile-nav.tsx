"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { dashboardNavigation } from "@/lib/dashboard/navigation";
import { cn } from "@/lib/utils";

export function DashboardMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto border-b bg-card px-4 py-3 lg:hidden">
      {dashboardNavigation.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === item.href
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium text-muted-foreground",
              isActive && "bg-primary text-primary-foreground",
              "featured" in item && item.featured &&
                !isActive &&
                "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
