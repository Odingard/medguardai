"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Lock,
  Play,
  RefreshCw,
  Shield,
  ShieldCheck,
  Sparkles,
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
import { getPatientCommandMetrics, getRiskBadgeClass } from "@/lib/patients/command-center";
import { usePatientStore } from "@/lib/stores/patientStore";
import { useSubscriptionStore } from "@/lib/stores/subscriptionStore";
import { cn } from "@/lib/utils";

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

export function CyberHygieneDashboard() {
  const { patients, currentPatientId } = usePatientStore();
  const hasAdvancedCyber = useSubscriptionStore((state) =>
    state.hasFeature("advancedCyber"),
  );
  const currentPatient =
    patients.find((patient) => patient.id === currentPatientId) ?? patients[0];
  const patientMetrics = getPatientCommandMetrics(currentPatient);
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
    setScanMessage(
      `${scanResult.summary} Current patient context: ${currentPatient.name} has ${patientMetrics.cyberRisk.toLowerCase()} patient-level cyber risk (${patientMetrics.cyberScore}/100).`,
    );
  }

  function handleRunAgent(agentId: AgentId, agentName: string) {
    setRunningAgent(agentId);
    setAgentRunMessage(
      `${simulateAgentRun(agentName)} Patient context: ${currentPatient.name}.`,
    );
    window.setTimeout(() => setRunningAgent(null), 600);
  }

  function handleToggleAgent(agentId: AgentId, enabled: boolean, agentName: string) {
    setAgentToggles((current) => ({
      ...current,
      [agentId]: enabled,
    }));
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
                Cyber Hygiene command center
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
                  <span className="text-5xl font-semibold">
                    {riskScore}
                  </span>
                  <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    score
                  </span>
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <CardTitle className="text-3xl">
                    Overall risk score
                  </CardTitle>
                  <CardDescription className="mt-3 text-base leading-7">
                    Color-coded 0-100 posture score covering breach exposure,
                    password health, phishing readiness, and HIPAA security
                    basics.
                  </CardDescription>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last scanned</span>
                    <span className="font-medium">{lastScanned}</span>
                  </div>
                  <Progress
                    value={riskScore}
                    indicatorClassName={riskTone.progressClassName}
                  />
                  <p className="text-sm text-muted-foreground">
                    {riskTrend}
                  </p>
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
            <div className="rounded-xl border bg-card/80 p-4 text-sm text-muted-foreground">
              {scanMessage}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Patient cyber context</CardTitle>
            <CardDescription>
              Patient-specific risk is contextual and does not require PHI for MVP testing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border bg-card p-4">
              <p className="font-semibold">Current Patient: {currentPatient.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentPatient.reason} · Last visit {currentPatient.lastVisit}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={getRiskBadgeClass(patientMetrics.cyberRisk)}>
                {patientMetrics.cyberRisk} risk · {patientMetrics.cyberScore}/100
              </Badge>
              <Badge variant="outline">
                {patientMetrics.intakePending ? "Intake pending" : "Intake clear"}
              </Badge>
              <Badge variant="outline">{patientMetrics.notesCount} notes</Badge>
            </div>
          </CardContent>
        </Card>

        <Card id="agentic-ai-mcps" className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <CardTitle>Agentic AI + MCP roadmap</CardTitle>
            </div>
            <CardDescription>
              Built for safe early testing without PHI, with connectors planned
              for breach intelligence, device posture, email security, and
              compliance evidence.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border bg-muted/40 p-4">
              <p className="text-sm font-semibold">
                Marketing hook: cybersecurity leadership for medical practices
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Position this module as the bridge between small-practice
                operations and practical security workflows: no PHI needed,
                clear value, and strong founder-market credibility.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/cyber-hygiene">
                Future cyber startup link placeholder
                <ArrowUpRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cyberMetrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.title} className="hover:border-primary/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardDescription>{metric.title}</CardDescription>
                <span className="rounded-lg bg-secondary p-2 text-secondary-foreground">
                  <Icon className="size-4" />
                </span>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-semibold">
                    {metric.value}
                  </span>
                  <span className="pb-1 text-sm text-muted-foreground">
                    {metric.detail}
                  </span>
                </div>
                <Progress
                  value={metric.progress}
                  className="mt-4"
                  indicatorClassName={metricStyles[metric.status]}
                />
                <p className="mt-3 text-sm text-muted-foreground">
                  {metric.helper}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="size-5 text-primary" />
              <CardTitle>Agentic AI agents</CardTitle>
            </div>
            <CardDescription>
              Toggle autonomous agents, run mock checks, and later connect each
              agent to real MCP-backed tools.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cyberAgents.map((agent) => {
              const Icon = agent.icon;
              const isRunning = runningAgent === agent.id;
              const isAdvancedAgent = [
                "phishing-simulation-runner",
                "weekly-compliance-report-generator",
              ].includes(agent.id);
              const locked = isAdvancedAgent && !hasAdvancedCyber;

              return (
                <div
                  key={agent.id}
                  className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div className="flex gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{agent.name}</h3>
                        <Badge variant="outline">{agent.cadence}</Badge>
                        {locked ? <Badge variant="outline">Premium+</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {agent.description}
                      </p>
                      <p className="mt-2 text-sm">
                        <span className="text-muted-foreground">
                          Last run:
                        </span>{" "}
                        {agent.lastRun} · {agent.result}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:justify-end">
                    <Switch
                      checked={agentToggles[agent.id]}
                      disabled={locked}
                      onCheckedChange={(checked) =>
                        handleToggleAgent(agent.id, checked, agent.name)
                      }
                      aria-label={`Toggle ${agent.name}`}
                    />
                    <Button
                      variant={locked ? "outline" : "default"}
                      size="sm"
                      asChild={locked}
                      onClick={locked ? undefined : () => handleRunAgent(agent.id, agent.name)}
                    >
                      {locked ? (
                        <Link href="/dashboard/billing">
                          <Lock />
                          Upgrade
                        </Link>
                      ) : (
                        <>
                          {isRunning ? (
                            <RefreshCw className="animate-spin" />
                          ) : (
                            <Play />
                          )}
                          Run Agent
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
            {!hasAdvancedCyber ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                Advanced Agentic Cyber agents require Premium or SMB. Upgrade in
                Billing to unlock phishing simulations and weekly compliance reports.
              </div>
            ) : null}
            <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
              {agentRunMessage}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="size-5 text-primary" />
              <CardTitle>Recent agent activity</CardTitle>
            </div>
            <CardDescription>
              Mock activity log showing how autonomous agents report back.
            </CardDescription>
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
                    <p className="mt-1 text-sm text-muted-foreground">
                      {activity.detail}
                    </p>
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
            <CardDescription>
              Security and compliance events with the action already taken.
            </CardDescription>
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
                    <TableCell className="whitespace-nowrap font-medium">
                      {alert.date}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("capitalize", severityStyles[alert.severity])}
                      >
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-[280px] text-muted-foreground">
                      {alert.description}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {alert.actionTaken}
                    </TableCell>
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
            <CardDescription>
              Actionable next steps sized for a small medical practice.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((recommendation) => {
              const Icon = recommendation.icon;

              return (
                <div
                  key={recommendation.title}
                  className="rounded-xl border bg-card p-4"
                >
                  <div className="flex gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-semibold">
                          {recommendation.title}
                        </h3>
                        <Badge variant="outline">
                          {recommendation.priority}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {recommendation.impact}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="mt-4 w-full"
                    variant="outline"
                    onClick={() =>
                      setAgentRunMessage(`Created mock remediation task: ${recommendation.title}`)
                    }
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
