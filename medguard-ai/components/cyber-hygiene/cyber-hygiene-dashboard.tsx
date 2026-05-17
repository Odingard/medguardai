"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Play,
  RefreshCw,
  Shield,
  ShieldCheck,
  Zap,
} from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PracticeRole } from "@/lib/auth/session";
import {
  agentActivity,
  cyberAgents,
  cyberMetrics,
  cyberRiskScore,
  getRiskTone,
  recentAlerts,
  recommendations,
  simulateAgentRun,
  simulateCyberScan,
  type AgentId,
  type AlertSeverity,
  type RiskLevel,
} from "@/lib/cyber-hygiene/data";
import { cn } from "@/lib/utils";

type CyberHygieneDashboardProps = {
  role: PracticeRole;
  userEmail: string;
};

const severityStyles: Record<AlertSeverity, string> = {
  critical:
    "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300",
  high: "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-300",
  medium:
    "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
  low: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
};

const metricStyles: Record<RiskLevel, string> = {
  low: "bg-emerald-500",
  medium: "bg-amber-500",
  high: "bg-red-500",
};

export function CyberHygieneDashboard({
  role,
  userEmail,
}: CyberHygieneDashboardProps) {
  if (role === "admin") {
    return <AdminDashboard />;
  }

  return <ProviderChecklist userEmail={userEmail} />;
}

function ProviderChecklist({ userEmail }: { userEmail: string }) {
  const myAlerts = recentAlerts.filter((alert) => alert.staffEmail === userEmail);
  const needsAttestation = myAlerts.some((alert) =>
    alert.description.toLowerCase().includes("attestation"),
  );
  const myRecommendations = recommendations.filter(
    (recommendation) =>
      recommendation.title.toLowerCase().includes("attestation") ||
      myAlerts.some((alert) =>
        alert.description
          .toLowerCase()
          .includes(recommendation.title.split(" ")[1]?.toLowerCase() ?? ""),
      ),
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-600" />
            <CardTitle>Your security status</CardTitle>
          </div>
          <CardDescription>
            Items that need your attention. Practice-wide posture is managed by your admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myAlerts.length === 0 ? (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
              <CheckCircle2 className="size-5 text-emerald-600" />
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                You&apos;re all clear — no action items right now.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {myAlerts.length} item{myAlerts.length > 1 ? "s" : ""} need your attention:
              </p>
              {myAlerts.map((alert) => (
                <div
                  key={`${alert.date}-${alert.description}`}
                  className={cn("rounded-xl border p-4", severityStyles[alert.severity])}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className={cn("capitalize", severityStyles[alert.severity])}>
                      {alert.severity}
                    </Badge>
                    <span className="text-xs">{alert.date}</span>
                  </div>
                  <p className="mt-2 text-sm">{alert.description}</p>
                  <p className="mt-1 text-xs opacity-80">Status: {alert.actionTaken}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>HIPAA compliance</CardTitle>
          <CardDescription>Required documents and attestations for your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ComplianceRow
            title="HIPAA Security Policy Attestation"
            description="Annual acknowledgment of practice security policies"
            complete={!needsAttestation}
            incompleteLabel="Signature needed"
          />
          <ComplianceRow
            title="HIPAA Privacy Notice"
            description="Acknowledgment of privacy practices"
            complete
          />
        </CardContent>
      </Card>

      {myRecommendations.length ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Your recommended actions</CardTitle>
            <CardDescription>Personal checklist items derived from your alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {myRecommendations.map((recommendation) => {
              const Icon = recommendation.icon;
              return (
                <div key={recommendation.title} className="rounded-xl border p-4">
                  <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 size-4 text-primary" />
                    <div>
                      <p className="font-medium">{recommendation.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{recommendation.impact}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      <div className="rounded-xl border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
        Practice-wide breach monitoring, agent controls, and full security posture are visible to your practice administrator.
      </div>
    </div>
  );
}

function ComplianceRow({
  title,
  description,
  complete,
  incompleteLabel = "Needed",
}: {
  title: string;
  description: string;
  complete: boolean;
  incompleteLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border p-3.5">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Badge
        variant="outline"
        className={
          complete
            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
            : "border-amber-300 bg-amber-50 text-amber-700"
        }
      >
        {complete ? "Complete" : incompleteLabel}
      </Badge>
    </div>
  );
}

function AdminDashboard() {
  const [riskScore, setRiskScore] = useState(cyberRiskScore.score);
  const [riskTrend, setRiskTrend] = useState(cyberRiskScore.trend);
  const [lastScanned, setLastScanned] = useState(cyberRiskScore.lastScanned);
  const [scanMessage, setScanMessage] = useState(cyberRiskScore.summary);
  const [runningAgent, setRunningAgent] = useState<AgentId | null>(null);
  const [agentRunMessage, setAgentRunMessage] = useState(
    "Agent runs are simulated for the MVP and ready to connect to real APIs.",
  );
  const [agentToggles, setAgentToggles] = useState<Record<AgentId, boolean>>(
    () =>
      cyberAgents.reduce(
        (state, agent) => ({
          ...state,
          [agent.id]: agent.enabled,
        }),
        {} as Record<AgentId, boolean>,
      ),
  );

  const riskTone = useMemo(() => getRiskTone(riskScore), [riskScore]);

  function handleScanNow() {
    const scanResult = simulateCyberScan();
    const nextScore = Math.min(100, riskScore + 2);
    setRiskScore(nextScore);
    setRiskTrend(`+${nextScore - cyberRiskScore.score} points after latest scan`);
    setLastScanned(scanResult.completedAt);
    setScanMessage(scanResult.summary);
  }

  function handleRunAgent(agentId: AgentId, agentName: string) {
    setRunningAgent(agentId);
    setAgentRunMessage(simulateAgentRun(agentName));
    window.setTimeout(() => setRunningAgent(null), 600);
  }

  function handleToggleAgent(agentId: AgentId, enabled: boolean, agentName: string) {
    setAgentToggles((current) => ({ ...current, [agentId]: enabled }));
    setAgentRunMessage(
      `${agentName} ${enabled ? "enabled" : "disabled"} for practice monitoring.`,
    );
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden border-emerald-300 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_38%),linear-gradient(135deg,_hsl(var(--card)),_hsl(var(--secondary)))] dark:border-emerald-900">
          <CardHeader className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge variant="success" className="gap-1">
                <ShieldCheck className="size-3" />
                Admin · Cyber Hygiene
              </Badge>
              <Badge variant="outline" className={riskTone.className}>
                {riskTone.label}
              </Badge>
            </div>
            <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:items-center">
              <div className="relative mx-auto flex size-48 items-center justify-center rounded-full border bg-card shadow-inner">
                <div
                  className="absolute inset-3 rounded-full"
                  style={{
                    background: `conic-gradient(hsl(var(--primary)) ${riskScore * 3.6}deg, hsl(var(--secondary)) 0deg)`,
                  }}
                />
                <div className="relative flex size-36 flex-col items-center justify-center rounded-full bg-card">
                  <span className="text-5xl font-semibold">{riskScore}</span>
                  <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">score</span>
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <CardTitle className="text-3xl">Overall risk score</CardTitle>
                  <CardDescription className="mt-3 text-base leading-7">
                    Composite score covering breach exposure and HIPAA compliance basics across the practice.
                  </CardDescription>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last scanned</span>
                    <span className="font-medium">{lastScanned}</span>
                  </div>
                  <Progress value={riskScore} indicatorClassName={riskTone.progressClassName} />
                  <p className="text-sm text-muted-foreground">{riskTrend}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleScanNow}>
                    <RefreshCw />
                    Scan Now
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="#agentic-ai-mcps">
                      Powered by Agentic AI & MCPs
                      <ArrowUpRight />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border bg-card/80 p-4 text-sm text-muted-foreground">{scanMessage}</div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {cyberMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.title}>
                <CardContent className="flex items-start gap-4 pt-6">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{metric.title}</h3>
                      <Badge
                        variant="outline"
                        className={
                          metric.status === "low"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : metric.status === "medium"
                              ? "border-amber-300 bg-amber-50 text-amber-700"
                              : "border-red-300 bg-red-50 text-red-700"
                        }
                      >
                        {metric.status}
                      </Badge>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-semibold">{metric.value}</span>
                      <span className="text-sm text-muted-foreground">{metric.detail}</span>
                    </div>
                    <Progress value={metric.progress} indicatorClassName={metricStyles[metric.status]} />
                    <p className="text-xs text-muted-foreground">{metric.helper}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]" id="agentic-ai-mcps">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="size-5 text-primary" />
              <CardTitle>Agentic AI & MCPs</CardTitle>
            </div>
            <CardDescription>Autonomous agents that monitor the practice and surface findings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {cyberAgents.map((agent) => {
              const Icon = agent.icon;
              const isRunning = runningAgent === agent.id;

              return (
                <div key={agent.id} className="flex flex-col gap-4 rounded-xl border bg-card p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{agent.name}</h3>
                        <Badge variant="outline">{agent.cadence}</Badge>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{agent.description}</p>
                      <p className="mt-2 text-sm">
                        <span className="text-muted-foreground">Last run:</span> {agent.lastRun} · {agent.result}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:justify-end">
                    <Switch
                      checked={agentToggles[agent.id]}
                      onCheckedChange={(checked) => handleToggleAgent(agent.id, checked, agent.name)}
                      aria-label={`Toggle ${agent.name}`}
                    />
                    <Button size="sm" onClick={() => handleRunAgent(agent.id, agent.name)}>
                      {isRunning ? <RefreshCw className="animate-spin" /> : <Play />}
                      Run Agent
                    </Button>
                  </div>
                </div>
              );
            })}
            <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">{agentRunMessage}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="size-5 text-primary" />
              <CardTitle>Recent agent activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {agentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={`${activity.time}-${activity.agent}`} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{activity.agent}</p>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock3 className="size-3" />
                        {activity.time}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{activity.detail}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-primary" />
              <CardTitle>Recent alerts</CardTitle>
            </div>
            <CardDescription>Security and compliance events with actions taken.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Action taken</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAlerts.map((alert) => (
                  <TableRow key={`${alert.date}-${alert.description}`}>
                    <TableCell className="whitespace-nowrap font-medium">{alert.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("capitalize", severityStyles[alert.severity])}>
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-[280px] text-muted-foreground">{alert.description}</TableCell>
                    <TableCell className="whitespace-nowrap">{alert.actionTaken}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              <CardTitle>Recommendations</CardTitle>
            </div>
            <CardDescription>Actionable next steps sized for a small medical practice.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((recommendation) => {
              const Icon = recommendation.icon;
              return (
                <div key={recommendation.title} className="rounded-xl border bg-card p-4">
                  <div className="flex gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-semibold">{recommendation.title}</h3>
                        <Badge variant="outline">{recommendation.priority}</Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{recommendation.impact}</p>
                    </div>
                  </div>
                  <Button
                    className="mt-4 w-full"
                    variant="outline"
                    onClick={() => setAgentRunMessage(`Created mock remediation task: ${recommendation.title}`)}
                  >
                    <CheckCircle2 />
                    Fix Now
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
