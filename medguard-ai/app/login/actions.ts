"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

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

export async function signOut() {
  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}
