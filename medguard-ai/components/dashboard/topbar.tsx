import { Bell, LogOut, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { signOut } from "@/app/login/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DashboardUser } from "@/lib/auth/session";

type DashboardTopbarProps = {
  user: DashboardUser;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function DashboardTopbar({ user }: DashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-3 lg:hidden">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <span className="font-semibold">MedGuard AI</span>
        </Link>
        <div className="hidden min-w-0 flex-1 items-center gap-3 rounded-full border bg-card px-4 py-2 text-sm text-muted-foreground shadow-sm lg:flex">
          <Search className="size-4" />
          <span>Search patients, notes, intake forms, and cyber actions...</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Notifications" asChild>
            <Link href="/dashboard#activity">
              <Bell />
            </Link>
          </Button>
          <div className="hidden items-center gap-3 rounded-full border bg-card py-1 pl-1 pr-3 shadow-sm sm:flex">
            <Avatar>
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="leading-tight">
              <p className="text-sm font-medium">{user.name}</p>
              <div className="mt-0.5 flex items-center gap-2">
                <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                  {user.role}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
          </div>
          <form action={signOut}>
            <Button variant="outline" size="sm" type="submit">
              <LogOut />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
