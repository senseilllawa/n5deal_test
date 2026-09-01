import { Badge } from "@/components/ui/badge";
import { titleCase } from "@/lib/format";

// Covers both AssetStatus and UserStatus — they share ACTIVE/SUSPENDED;
// SOLD maps to the same neutral "removed" treatment (no longer actionable).
// Colors live in globals.css (--status-*) via Badge's status-* variants —
// never hardcode a color here, see CLAUDE.md "Design tokens".
const VARIANT: Record<string, "status-active" | "status-pending" | "status-suspended" | "status-removed"> = {
  ACTIVE: "status-active",
  PENDING: "status-pending",
  SOLD: "status-removed",
  SUSPENDED: "status-suspended",
  REMOVED: "status-removed",
};

export function StatusBadge({ status, reason }: { status: string; reason?: string | null }) {
  return (
    <Badge variant={VARIANT[status] ?? "status-removed"} title={reason ?? undefined}>
      {titleCase(status)}
    </Badge>
  );
}
