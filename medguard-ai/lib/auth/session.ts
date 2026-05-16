import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

import {
  demoSessionCookieName,
  demoSessionCookieValue,
  isDemoAuthEnabled,
} from "@/lib/auth/demo";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type PracticeRole = "provider" | "admin";

export type DashboardUser = {
  id: string;
  name: string;
  email: string;
  role: PracticeRole;
  avatarUrl?: string;
};

const demoUser: DashboardUser = {
  id: "demo-provider",
  name: "Dr. Maya Chen",
  email: "maya.chen@ridgewayfamilycare.example",
  role: "provider",
};

function getDisplayName(user: User) {
  const metadataName =
    typeof user.user_metadata.name === "string" ? user.user_metadata.name : "";
  const fullName =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : "";

  return metadataName || fullName || user.email?.split("@")[0] || "Provider";
}

function getRole(user: User): PracticeRole {
  return user.user_metadata.role === "admin" ? "admin" : "provider";
}

export async function getDashboardUser(): Promise<DashboardUser> {
  const cookieStore = await cookies();
  const hasDemoSession =
    isDemoAuthEnabled() &&
    cookieStore.get(demoSessionCookieName)?.value === demoSessionCookieValue;

  if (hasDemoSession || !hasSupabaseConfig()) {
    return demoUser;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return demoUser;
  }

  return {
    id: user.id,
    name: getDisplayName(user),
    email: user.email ?? "provider@medguard.ai",
    role: getRole(user),
    avatarUrl:
      typeof user.user_metadata.avatar_url === "string"
        ? user.user_metadata.avatar_url
        : undefined,
  };
}
