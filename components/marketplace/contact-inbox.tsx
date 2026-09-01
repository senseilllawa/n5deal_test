import Link from "next/link";
import { Inbox as InboxIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toggleContactRead } from "@/lib/actions/contact-request";
import type { InboxData, InboxItem } from "@/lib/inbox";

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function CountPill({ count }: { count: number }) {
  return (
    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{count}</span>
  );
}

/** One message, either direction — the only difference is whether the
 * read/unread toggle renders (that's the *recipient's* own inbox flag, so
 * it only makes sense on something that arrived, never on something sent —
 * see schema.prisma's doc comment on ContactRequest.isRead). */
function MessageCard({ item, showReadToggle }: { item: InboxItem; showReadToggle?: boolean }) {
  return (
    <li className="rounded-xl border border-border p-4 transition-colors hover:border-foreground/20">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-medium">{item.counterpart.name}</p>
          <p className="truncate text-xs text-muted-foreground">{item.counterpart.email}</p>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
      </div>
      {/* assetTitle stands in for a subject line — there's no separate
          subject field on ContactRequest, and this is real data either way
          (see schema.prisma). */}
      {item.assetTitle && <p className="mt-2 text-sm font-medium text-primary">Re: {item.assetTitle}</p>}
      <p className="mt-1 text-sm wrap-break-word text-muted-foreground">{item.message}</p>
      {showReadToggle && (
        <form action={toggleContactRead.bind(null, item.id, !item.isRead)} className="mt-3">
          <Button type="submit" variant="ghost" size="xs" className="text-muted-foreground">
            {item.isRead ? "Mark unread" : "Mark read"}
          </Button>
        </form>
      )}
    </li>
  );
}

/** Shared by /seller/inbox and /buyer/inbox — see lib/inbox.ts. The empty
 * "Incoming" state's CTA is the one thing that has to differ per role (a
 * Buyer browses assets, a Seller browses buyers), so it's the one prop
 * this otherwise fully shared component takes. */
export function ContactInbox({
  incoming,
  outgoing,
  emptyIncomingCta,
}: InboxData & { emptyIncomingCta?: { href: string; label: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Incoming</CardTitle>
          <CardDescription>Messages other participants sent you</CardDescription>
          <CardAction>
            <CountPill count={incoming.length} />
          </CardAction>
        </CardHeader>
        <CardContent>
          {incoming.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-10 text-center">
              <InboxIcon className="size-8 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="font-medium">No messages yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Nothing here yet — messages will show up as soon as someone reaches out.
                </p>
              </div>
              {emptyIncomingCta && (
                <Link
                  href={emptyIncomingCta.href}
                  className={buttonVariants({ variant: "outline", size: "sm", className: "mt-1" })}
                >
                  {emptyIncomingCta.label}
                </Link>
              )}
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {incoming.map((item) => (
                <MessageCard key={item.id} item={item} showReadToggle />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sent</CardTitle>
          <CardDescription>Messages you&apos;ve sent to others</CardDescription>
          <CardAction>
            <CountPill count={outgoing.length} />
          </CardAction>
        </CardHeader>
        <CardContent>
          {outgoing.length === 0 ? (
            <p className="text-sm text-muted-foreground">You haven&apos;t sent any messages yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {outgoing.map((item) => (
                <MessageCard key={item.id} item={item} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
