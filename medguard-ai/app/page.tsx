import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_32%),linear-gradient(135deg,_hsl(var(--background)),_hsl(var(--secondary)))]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <ShieldCheck className="size-6" />
            </span>
            <span className="text-xl font-semibold tracking-tight">
              MedGuard AI
            </span>
          </Link>
          <Button asChild>
            <Link href="/login">
              Sign in
              <ArrowRight />
            </Link>
          </Button>
        </header>

        <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <Badge variant="success" className="w-fit">
              Built for solo and small medical practices
            </Badge>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl">
                AI practice operations with cyber readiness at the center.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                MedGuard AI brings clinical notes, intake, legal workflows,
                data migration, and Cyber Hygiene into one professional SaaS
                dashboard.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Open dashboard
                  <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Magic-link login</Link>
              </Button>
            </div>
          </div>

          <Card className="border-primary/10 bg-card/90 shadow-xl shadow-primary/10">
            <CardHeader>
              <Badge variant="outline" className="w-fit">
                Foundation ready
              </Badge>
              <CardTitle className="text-2xl">Core modules</CardTitle>
              <CardDescription>
                A modular workspace designed to grow one production-minded
                module at a time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "Clinical Notes",
                "Smart Intake",
                "Legal Documents",
                "Cyber Hygiene",
                "Data Migration",
              ].map((module) => (
                <div
                  key={module}
                  className="flex items-center justify-between rounded-xl border bg-background/70 p-4"
                >
                  <span className="font-medium">{module}</span>
                  <CheckCircle2 className="size-5 text-emerald-500" />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
