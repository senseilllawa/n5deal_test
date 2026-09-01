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
          <Button type="submit" variant="outline" className="w-full" disabled={pending}>
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
