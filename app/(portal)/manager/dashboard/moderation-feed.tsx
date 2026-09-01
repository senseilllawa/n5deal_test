import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export interface ModerationLogEntry {
  id: string;
  actorName: string;
  actionLabel: string;
  targetName: string;
  reason: string | null;
  createdAtLabel: string;
}

export function ModerationFeed({ logs }: { logs: ModerationLogEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent moderation activity</CardTitle>
        <CardDescription>Your latest marketplace actions</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-10 text-center">
            <ClipboardCheck className="size-8 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="font-medium">No moderation actions yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Suspend, remove, or restore something from Users or Assets and it&apos;ll show up here.
              </p>
            </div>
            <Link href="/manager/users" className={buttonVariants({ variant: "outline", size: "sm", className: "mt-1" })}>
              Go to Users
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {logs.map((log) => (
              <li key={log.id} className="rounded-xl border border-border p-3 text-sm">
                <span className="font-medium">{log.actorName}</span> {log.actionLabel}{" "}
                <span className="font-medium">{log.targetName}</span>
                {log.reason && <span className="text-muted-foreground"> — {log.reason}</span>}
                <div className="mt-1 text-xs text-muted-foreground">{log.createdAtLabel}</div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
