"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction, CardFooter } from "@/components/ui/card";
import { StatusBadge } from "@/components/marketplace/status-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginAs, type LoginActionState } from "./actions";
import type { UserStatus } from "@/lib/generated/prisma/enums";

export interface DemoAccount {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
}

export function LoginCard({ account, returnTo }: { account: DemoAccount; returnTo: string | null }) {
  const boundLoginAs = loginAs.bind(null, account.id, returnTo);
  const [state, formAction, pending] = useActionState<LoginActionState, FormData>(boundLoginAs, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{account.name}</CardTitle>
        <CardDescription>{account.email}</CardDescription>
        {account.status !== "ACTIVE" && (
          <CardAction>
            <StatusBadge status={account.status} />
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          {/* buttonVariants bakes in whitespace-nowrap + a fixed h-8 (see
              components/ui/button.tsx) — fine for a short static label, but
              this one embeds an org name of unpredictable length ("Malta
              Gaming & Fintech Holdings"), which pokes text out past the
              pill's rounded border instead of wrapping. Override both so a
              long name wraps onto a second line and the button grows to
              fit it, instead of overflowing. */}
          <Button
            type="submit"
            variant="outline"
            className="h-auto w-full min-h-8 whitespace-normal py-1.5 text-center"
            disabled={pending}
          >
            {pending ? "Signing in…" : `Log in as ${account.name}`}
          </Button>
        </form>
      </CardContent>
      {state?.error && (
        <CardFooter>
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        </CardFooter>
      )}
    </Card>
  );
}
