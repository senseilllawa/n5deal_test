import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatBar } from "./stat-bar";

interface RoleCounts {
  active: number;
  suspended: number;
  removed: number;
}

export function UsersOverviewCard({ buyers, sellers }: { buyers: RoleCounts; sellers: RoleCounts }) {
  const total =
    buyers.active + buyers.suspended + buyers.removed + sellers.active + sellers.suspended + sellers.removed;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>By role and status</CardDescription>
        <CardAction>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {total} total
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="pb-2 font-normal">Role</th>
              <th className="pb-2 text-right font-normal">Active</th>
              <th className="pb-2 text-right font-normal">Suspended</th>
              <th className="pb-2 text-right font-normal">Removed</th>
            </tr>
          </thead>
          <tbody className="[&_td]:py-1.5 [&_tr]:border-t [&_tr]:border-border">
            <tr>
              <td className="font-medium">Buyers</td>
              <td className="text-right font-semibold text-status-active">{buyers.active}</td>
              <td className="text-right font-semibold text-status-suspended">{buyers.suspended}</td>
              <td className="text-right font-semibold text-muted-foreground">{buyers.removed}</td>
            </tr>
            <tr>
              <td className="font-medium">Sellers</td>
              <td className="text-right font-semibold text-status-active">{sellers.active}</td>
              <td className="text-right font-semibold text-status-suspended">{sellers.suspended}</td>
              <td className="text-right font-semibold text-muted-foreground">{sellers.removed}</td>
            </tr>
          </tbody>
        </table>

        <StatBar
          segments={[
            { value: buyers.active + sellers.active, className: "bg-status-active", label: "Active" },
            { value: buyers.suspended + sellers.suspended, className: "bg-status-suspended", label: "Suspended" },
            { value: buyers.removed + sellers.removed, className: "bg-status-removed", label: "Removed" },
          ]}
        />
      </CardContent>
    </Card>
  );
}
