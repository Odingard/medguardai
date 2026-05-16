"use client";

import { useMemo, useState } from "react";
import { Calculator, Copy, ShieldCheck, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RoiCalculatorProps = {
  variant?: "overview" | "billing";
};

export function RoiCalculator({ variant = "overview" }: RoiCalculatorProps) {
  const [providers, setProviders] = useState(2);
  const [patientsPerDay, setPatientsPerDay] = useState(18);
  const [chartingHoursPerWeek, setChartingHoursPerWeek] = useState(14);
  const [billingRate, setBillingRate] = useState(200);
  const [message, setMessage] = useState("");

  const roi = useMemo(() => {
    const weeklyHoursSaved = Math.round(chartingHoursPerWeek * 0.38 * providers);
    const monthlyHoursSaved = weeklyHoursSaved * 4;
    const monthlyRevenueLift = monthlyHoursSaved * billingRate;
    const yearlyRevenueLift = monthlyRevenueLift * 12;
    const intakeMinutesSaved = Math.round(patientsPerDay * providers * 9);
    const cyberRiskReduction = Math.min(42, 12 + providers * 4);

    return {
      weeklyHoursSaved,
      monthlyHoursSaved,
      monthlyRevenueLift,
      yearlyRevenueLift,
      intakeMinutesSaved,
      cyberRiskReduction,
    };
  }, [billingRate, chartingHoursPerWeek, patientsPerDay, providers]);

  async function copySummary() {
    const summary = [
      "MedGuard AI ROI estimate",
      `Providers: ${providers}`,
      `Patients/day: ${patientsPerDay}`,
      `Charting hours/week/provider: ${chartingHoursPerWeek}`,
      `Estimated monthly hours saved: ${roi.monthlyHoursSaved}`,
      `Estimated monthly revenue lift: $${roi.monthlyRevenueLift.toLocaleString()}`,
      `Estimated cyber risk reduction: ${roi.cyberRiskReduction}%`,
    ].join("\n");

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(summary);
      setMessage("ROI summary copied for sharing.");
    } else {
      setMessage("ROI summary ready to share.");
    }
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="success">
            {variant === "billing" ? "Upgrade motivation" : "ROI Calculator"}
          </Badge>
          <Badge variant="outline">$150-$250/hr model</Badge>
        </div>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="size-5 text-primary" />
          Estimate MedGuard AI ROI
        </CardTitle>
        <CardDescription>
          Show practice owners how documentation, intake automation, and cyber
          readiness translate into real operational value.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor={`${variant}-providers`}>Providers</Label>
            <Input
              id={`${variant}-providers`}
              type="number"
              min={1}
              value={providers}
              onChange={(event) => setProviders(Number(event.target.value || 1))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${variant}-patients`}>Avg patients/day</Label>
            <Input
              id={`${variant}-patients`}
              type="number"
              min={1}
              value={patientsPerDay}
              onChange={(event) =>
                setPatientsPerDay(Number(event.target.value || 1))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${variant}-charting`}>
              Charting hrs/week/provider
            </Label>
            <Input
              id={`${variant}-charting`}
              type="number"
              min={1}
              value={chartingHoursPerWeek}
              onChange={(event) =>
                setChartingHoursPerWeek(Number(event.target.value || 1))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${variant}-rate`}>Billing value/hr</Label>
            <Input
              id={`${variant}-rate`}
              type="number"
              min={150}
              max={250}
              value={billingRate}
              onChange={(event) =>
                setBillingRate(Number(event.target.value || 200))
              }
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border bg-card p-4">
            <TrendingUp className="size-5 text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">
              Monthly hours saved
            </p>
            <p className="text-3xl font-semibold">{roi.monthlyHoursSaved}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <TrendingUp className="size-5 text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">
              Monthly revenue lift
            </p>
            <p className="text-3xl font-semibold">
              ${roi.monthlyRevenueLift.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <TrendingUp className="size-5 text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">
              Intake minutes saved/day
            </p>
            <p className="text-3xl font-semibold">{roi.intakeMinutesSaved}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <ShieldCheck className="size-5 text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">
              Cyber risk reduction
            </p>
            <p className="text-3xl font-semibold">{roi.cyberRiskReduction}%</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={copySummary} variant="outline">
            <Copy />
            Copy shareable summary
          </Button>
          <p className="text-sm text-muted-foreground">
            Annualized value: ${roi.yearlyRevenueLift.toLocaleString()}
          </p>
          {message ? <p className="text-sm text-primary">{message}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
