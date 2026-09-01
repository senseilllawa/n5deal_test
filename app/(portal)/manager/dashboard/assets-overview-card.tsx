import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatBar } from "./stat-bar";

// Same four buckets StatusBadge maps AssetStatus to (SOLD reuses "removed" —
// see components/marketplace/status-badge.tsx's doc comment) — the dot
// colors here are the same --status-* tokens, just read directly instead
// of through a <Badge>, since a bare colored dot next to a count reads
// better in a dense list than a full pill would.
const ROWS: { label: string; key: "active" | "pending" | "sold" | "suspended"; dotClassName: string }[] = [
  { label: "Active", key: "active", dotClassName: "bg-status-active" },
  { label: "Pending", key: "pending", dotClassName: "bg-status-pending" },
  { label: "Sold", key: "sold", dotClassName: "bg-status-removed" },
  { label: "Suspended", key: "suspended", dotClassName: "bg-status-suspended" },
];

export function AssetsOverviewCard({
  active,
  pending,
  sold,
  suspended,
}: {
  active: number;
  pending: number;
  sold: number;
  suspended: number;
}) {
  const counts = { active, pending, sold, suspended };
  const total = active + pending + sold + suspended;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assets</CardTitle>
        <CardDescription>Current inventory health</CardDescription>
        <CardAction>
          <span className="rounded-full bg-status-active/10 px-2.5 py-1 text-xs font-medium text-status-active">
            {total} listed
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="flex flex-col gap-2.5 text-sm">
          {ROWS.map(({ label, key, dotClassName }) => (
            <li key={key} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className={`size-2 shrink-0 rounded-full ${dotClassName}`} aria-hidden="true" />
                {label}
              </span>
              <span className="font-semibold">{counts[key]}</span>
            </li>
          ))}
        </ul>

        <StatBar
          segments={ROWS.map(({ label, key, dotClassName }) => ({
            value: counts[key],
            className: dotClassName,
            label,
          }))}
        />
      </CardContent>
    </Card>
  );
}
