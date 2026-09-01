import { toggleContactRead } from "@/lib/actions/contact-request";
import type { InboxData } from "@/lib/inbox";

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/** Shared by /seller/inbox and /buyer/inbox — see lib/inbox.ts. */
export function ContactInbox({ incoming, outgoing }: InboxData) {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h1 className="text-xl font-semibold">Incoming ({incoming.length})</h1>
        {incoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No one has contacted you yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {incoming.map((item) => (
              <li key={item.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {item.counterpart.name}{" "}
                      <span className="font-normal text-muted-foreground">({item.counterpart.email})</span>
                    </p>
                    {item.assetTitle && <p className="text-xs text-muted-foreground">Re: {item.assetTitle}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm">{item.message}</p>
                <form action={toggleContactRead.bind(null, item.id, !item.isRead)} className="mt-2">
                  <button type="submit" className="text-xs text-muted-foreground underline underline-offset-4">
                    {item.isRead ? "Mark unread" : "Mark read"}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* No isRead here on purpose: that field is the recipient's own inbox
          toggle, not an automatic "seen" signal (see schema.prisma's doc
          comment on ContactRequest.isRead) — showing it here would imply a
          read-receipt feature that doesn't actually exist. */}
      <section className="flex flex-col gap-3">
        <h1 className="text-xl font-semibold">Sent ({outgoing.length})</h1>
        {outgoing.length === 0 ? (
          <p className="text-sm text-muted-foreground">You haven&apos;t sent any messages yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {outgoing.map((item) => (
              <li key={item.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {item.counterpart.name}{" "}
                      <span className="font-normal text-muted-foreground">({item.counterpart.email})</span>
                    </p>
                    {item.assetTitle && <p className="text-xs text-muted-foreground">Re: {item.assetTitle}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm">{item.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
