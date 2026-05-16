import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  demoSessionCookieName,
  demoSessionCookieValue,
  isDemoAuthEnabled,
} from "@/lib/auth/demo";

import { getSupabaseConfig, hasSupabaseConfig } from "./config";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isAuthRoute = request.nextUrl.pathname.startsWith("/login");

  const hasDemoSession =
    isDemoAuthEnabled() &&
    request.cookies.get(demoSessionCookieName)?.value === demoSessionCookieValue;

  if (hasDemoSession && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (hasDemoSession || !hasSupabaseConfig()) {
    return response;
  }

  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}
