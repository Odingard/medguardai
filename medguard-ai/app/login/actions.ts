"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  demoSessionCookieName,
  demoSessionCookieValue,
  isDemoAuthEnabled,
} from "@/lib/auth/demo";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function signInWithMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email) {
    redirect("/login?message=Enter%20your%20email%20address");
  }

  if (!hasSupabaseConfig()) {
    redirect(
      "/login?message=Supabase%20environment%20variables%20are%20required%20to%20send%20magic%20links",
    );
  }

  const headersList = await headers();
  const origin = headersList.get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
      data: {
        role: "provider",
      },
    },
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  redirect(
    "/login?message=Check%20your%20email%20for%20a%20MedGuard%20AI%20magic%20link",
  );
}

export async function signInDemoMode() {
  if (!isDemoAuthEnabled()) {
    redirect("/login?message=Demo%20mode%20is%20disabled");
  }

  const cookieStore = await cookies();
  cookieStore.set(demoSessionCookieName, demoSessionCookieValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect("/dashboard");
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(demoSessionCookieName);

  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}
