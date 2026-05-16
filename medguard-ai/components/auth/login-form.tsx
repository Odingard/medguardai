import { ArrowRight, FlaskConical, LockKeyhole, Mail } from "lucide-react";

import { signInDemoMode, signInWithMagicLink } from "@/app/login/actions";
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

type LoginFormProps = {
  message?: string;
};

export function LoginForm({ message }: LoginFormProps) {
  return (
    <Card className="w-full max-w-md border-primary/10 bg-card/95 shadow-xl shadow-primary/5">
      <CardHeader className="space-y-4">
        <Badge variant="success" className="w-fit">
          HIPAA-minded workflow foundation
        </Badge>
        <div className="space-y-2">
          <CardTitle className="text-2xl">Sign in to MedGuard AI</CardTitle>
          <CardDescription>
            Enter your practice email and we&apos;ll send a secure Supabase
            magic link.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form action={signInWithMagicLink} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Practice email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="provider@yourpractice.com"
                className="pl-9"
                autoComplete="email"
                required
              />
            </div>
          </div>
          {message ? (
            <p className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
              {message}
            </p>
          ) : null}
          <Button type="submit" className="w-full">
            Send magic link
            <ArrowRight />
          </Button>
        </form>
        <form action={signInDemoMode} className="mt-3">
          <Button type="submit" variant="outline" className="w-full">
            <FlaskConical />
            Continue in Demo Mode
          </Button>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">
          Use Demo Mode when Supabase email delivery is not configured locally.
        </p>
        <div className="mt-6 flex items-start gap-3 rounded-lg bg-secondary/60 p-4 text-sm text-secondary-foreground">
          <LockKeyhole className="mt-0.5 size-4 shrink-0" />
          <p>
            Roles default to provider. Admin access can be promoted from
            Supabase user metadata when your practice workspace is configured.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
