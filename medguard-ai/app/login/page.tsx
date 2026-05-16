import { ShieldCheck } from "lucide-react";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

type LoginPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { message } = await searchParams;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_32%),linear-gradient(135deg,_hsl(var(--background)),_hsl(var(--secondary)))] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section className="space-y-8">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <ShieldCheck className="size-6" />
              </span>
              <span className="text-2xl font-semibold tracking-tight">
                MedGuard AI
              </span>
            </Link>
            <div className="max-w-2xl space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                Secure practice operations
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
                AI support for documentation, intake, compliance, and cyber
                readiness.
              </h1>
              <p className="text-lg leading-8 text-muted-foreground">
                A professional SaaS foundation for solo and small medical
                practices, starting with passwordless Supabase authentication.
              </p>
            </div>
          </section>
          <LoginForm message={message} />
        </div>
      </div>
    </main>
  );
}
