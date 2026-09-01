import { cn } from "@/lib/utils";

/**
 * A single-row proportional bar — "how much of this total falls into each
 * bucket," at a glance, next to the exact counts a table already gives.
 * Kept intentionally dumb: no legend, no animation, one aria-label
 * summarizing every segment for screen readers (individual <span>s carry
 * no meaningful accessible content of their own).
 */
export function StatBar({
  segments,
}: {
  segments: { value: number; className: string; label: string }[];
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return <div className="h-1.5 w-full rounded-full bg-muted" />;
  }

  return (
    <div
      role="img"
      aria-label={segments.map((s) => `${s.label}: ${s.value}`).join(", ")}
      className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted"
    >
      {segments
        .filter((s) => s.value > 0)
        .map((s) => (
          <span
            key={s.label}
            className={cn("h-full first:rounded-l-full last:rounded-r-full", s.className)}
            style={{ width: `${(s.value / total) * 100}%` }}
          />
        ))}
    </div>
  );
}
