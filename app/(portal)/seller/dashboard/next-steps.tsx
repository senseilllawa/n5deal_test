import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function NextSteps({ unreadCount }: { unreadCount: number }) {
  const steps = [
    {
      href: "/seller/assets",
      title: "Review your assets",
      description: "Make sure your listings are up to date.",
    },
    {
      href: "/seller/inbox",
      title: "Check messages",
      description:
        unreadCount > 0
          ? unreadCount === 1
            ? "One buyer is waiting for a reply."
            : `${unreadCount} buyers are waiting for a reply.`
          : "You're caught up — nothing waiting right now.",
    },
    {
      href: "/seller/buyers",
      title: "Browse buyers",
      description: "Find your next buyer match.",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your next steps</CardTitle>
        <CardDescription>Get the most from your seller account</CardDescription>
        <CardAction>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {steps.length} items
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {steps.map((step, i) => (
          <Link
            key={step.href}
            href={step.href}
            className="group flex items-center gap-3 rounded-xl border border-border p-3 text-sm outline-none transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-medium">{step.title}</span>
              <span className="text-muted-foreground">{step.description}</span>
            </span>
            <ArrowRight
              className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
              aria-hidden="true"
            />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
