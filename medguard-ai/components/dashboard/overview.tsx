import { ArrowUpRight, ShieldAlert, Sparkles } from "lucide-react";

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
import {
  cyberReadinessSignals,
  overviewStats,
  recentActivity,
} from "@/lib/dashboard/mock-data";
import { cn } from "@/lib/utils";

export function DashboardOverview() {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
        <Card className="overflow-hidden border-primary/10 bg-[linear-gradient(135deg,_hsl(var(--card)),_hsl(var(--secondary)))]">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="success">Cyber Hygiene highlighted</Badge>
              <Badge variant="outline">Provider workspace</Badge>
            </div>
            <div className="space-y-3 pt-4">
              <CardTitle className="max-w-3xl text-3xl tracking-tight sm:text-4xl">
                Practice operations, clinical AI, and cyber readiness in one
                trusted command center.
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-7">
                MedGuard AI helps small medical practices reduce admin burden,
                accelerate documentation, and keep security work visible before
                it becomes a crisis.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button>
              Start today&apos;s review
              <ArrowUpRight />
            </Button>
            <Button variant="outline">View intake queue</Button>
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
                  84
                </span>
                <span className="text-sm text-muted-foreground">
                  Low risk target: 90+
                </span>
              </div>
              <Progress value={84} className="mt-3 bg-emerald-200" />
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card
              key={stat.label}
              className={cn(
                "transition-colors hover:border-primary/40",
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
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Fake operational feed for the initial MedGuard foundation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;

              return (
                <div key={activity.title} className="flex gap-4">
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
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <CardTitle>Module roadmap</CardTitle>
            </div>
            <CardDescription>
              Build each MedGuard capability as an independent module.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="foundation">
              <TabsList>
                <TabsTrigger active>Foundation</TabsTrigger>
                <TabsTrigger>Next</TabsTrigger>
              </TabsList>
              <TabsContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Authentication, dashboard navigation, overview metrics, and
                  Cyber Hygiene emphasis are ready.
                </p>
                <p>
                  The next focused build can turn Cyber Hygiene into an
                  agentic assessment workflow with findings, scores, and tasks.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
