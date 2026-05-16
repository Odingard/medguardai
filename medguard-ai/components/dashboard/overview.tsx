"use client";

import Link from "next/link";
import { ArrowUpRight, ShieldAlert, Sparkles, UsersRound } from "lucide-react";

import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { RoiCalculator } from "@/components/roi/roi-calculator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cyberReadinessSignals } from "@/lib/dashboard/mock-data";
import {
  connectedOverviewStats,
  connectedRecentActivity,
  dashboardQuickActions,
} from "@/lib/dashboard/overview-data";
import { cyberRiskScore } from "@/lib/cyber-hygiene/data";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";
import { usePatientStore } from "@/lib/stores/patientStore";
import { useSubscriptionStore } from "@/lib/stores/subscriptionStore";
import { cn } from "@/lib/utils";

export function DashboardOverview() {
  const { patients, currentPatientId } = usePatientStore();
  const restartOnboarding = useOnboardingStore((state) => state.restartOnboarding);
  const hasAdvancedAnalytics = useSubscriptionStore((state) =>
    state.hasFeature("advancedAnalytics"),
  );
  const currentPatient =
    patients.find((patient) => patient.id === currentPatientId) ?? patients[0];

  return (
    <div className="space-y-8">
      <OnboardingTour />
      <section className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
        <Card className="overflow-hidden border-primary/10 bg-[linear-gradient(135deg,_hsl(var(--card)),_hsl(var(--secondary)))]">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="success">Connected MedGuard OS</Badge>
              <Badge variant="outline">Five-module MVP</Badge>
            </div>
            <div className="space-y-3 pt-4">
              <CardTitle className="max-w-3xl text-3xl tracking-tight sm:text-4xl">
                One dashboard for intake, notes, legal workflows, cyber posture,
                and legacy data import.
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-7">
                The modules now share patient context and handoffs, so completed
                intake and imported records can flow directly into Clinical
                Notes while legal and cyber workflows stay connected to the same
                practice command center.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border bg-card/70 p-4 text-sm">
              <p className="font-semibold">Current Patient: {currentPatient.name}</p>
              <p className="mt-1 text-muted-foreground">
                Quick starts will open modules with this shared patient context.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/dashboard/patients">
                  Open patient directory
                  <UsersRound />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/smart-intake">
                  Start intake-to-note flow
                  <ArrowUpRight />
                </Link>
              </Button>
              <Button variant="ghost" onClick={restartOnboarding}>
                Restart tour
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/80 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="success">Differentiator</Badge>
              <ShieldAlert className="size-5 text-emerald-700 dark:text-emerald-300" />
            </div>
            <CardTitle>Cyber Hygiene readiness</CardTitle>
            <CardDescription>
              A practical risk posture snapshot for solo and small practices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-semibold text-emerald-700 dark:text-emerald-300">
                  {cyberRiskScore.score}
                </span>
                <span className="text-sm text-muted-foreground">
                  Low risk target: 90+
                </span>
              </div>
              <Progress value={cyberRiskScore.score} className="mt-3 bg-emerald-200" />
            </div>
            <ul className="space-y-2 text-sm">
              {cyberReadinessSignals.map((signal) => (
                <li key={signal} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  {signal}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {connectedOverviewStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Link key={stat.label} href={stat.href}>
              <Card
                className={cn(
                  "h-full transition-colors hover:border-primary/40",
                  stat.featured &&
                    "border-emerald-300 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/20",
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardDescription>{stat.label}</CardDescription>
                  <span
                    className={cn(
                      "rounded-lg bg-secondary p-2 text-secondary-foreground",
                      stat.featured &&
                        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">{stat.value}</div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {stat.helper}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardQuickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Card
              key={action.title}
              className={cn(
                "transition-colors hover:border-primary/40",
                action.featured &&
                  "border-emerald-300 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/20",
              )}
            >
              <CardHeader>
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant={action.featured ? "default" : "outline"} asChild>
                  <Link href={action.href}>
                    Launch
                    <ArrowUpRight />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <RoiCalculator />

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity across modules</CardTitle>
            <CardDescription>
              A unified operational feed showing how MedGuard workflows connect.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {connectedRecentActivity.map((activity) => {
              const Icon = activity.icon;

              return (
                <Link
                  key={activity.title}
                  href={activity.href}
                  className="flex gap-4 rounded-xl p-2 transition-colors hover:bg-muted/60"
                >
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground",
                      activity.featured &&
                        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{activity.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {activity.time}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {activity.detail}
                    </p>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <CardTitle>Cohesion roadmap</CardTitle>
            </div>
            <CardDescription>
              The app now behaves more like one operating system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="foundation">
              <TabsList>
                <TabsTrigger active>Connected</TabsTrigger>
                <TabsTrigger>Next</TabsTrigger>
              </TabsList>
              <TabsContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Shared patient state, module handoffs, connected activity,
                  and a patient directory are in place for internal testing.
                </p>
                {hasAdvancedAnalytics ? (
                  <p>
                    Advanced analytics are unlocked. Next polish can connect
                    durable Supabase-backed patient records and live ROI charts.
                  </p>
                ) : (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                    Advanced analytics / ROI dashboard requires Premium or SMB.
                    Visit Billing to unlock revenue and productivity reporting.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
