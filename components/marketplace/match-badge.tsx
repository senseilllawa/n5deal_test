import { Badge } from "@/components/ui/badge";

/** Renders a lib/matching.ts score (0-100). Its own token (--match, badge
 * variant "match") — not the brand accent, not a status color. */
export function MatchBadge({ score }: { score: number }) {
  return <Badge variant="match">Match {score}%</Badge>;
}
