import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuditAction } from "@/lib/generated/prisma/enums";

function formatDateTime(d: Date): string {
  return d.toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const ACTION_LABEL: Record<AuditAction, string> = {
  SUSPEND_USER: "suspended user",
  REMOVE_USER: "removed user",
  REACTIVATE_USER: "reactivated user",
  SUSPEND_ASSET: "suspended asset",
  RESTORE_ASSET: "restored asset",
};

export default async function ManagerDashboardPage() {
  const manager = await requireUser({ role: "MANAGER" });

  const [
    buyerActive,
    buyerSuspended,
    buyerRemoved,
    sellerActive,
    sellerSuspended,
    sellerRemoved,
    assetActive,
    assetPending,
    assetSold,
    assetSuspended,
    recentLogs,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "BUYER", status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "BUYER", status: "SUSPENDED" } }),
    prisma.user.count({ where: { role: "BUYER", status: "REMOVED" } }),
    prisma.user.count({ where: { role: "SELLER", status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "SELLER", status: "SUSPENDED" } }),
    prisma.user.count({ where: { role: "SELLER", status: "REMOVED" } }),
    prisma.asset.count({ where: { status: "ACTIVE" } }),
    prisma.asset.count({ where: { status: "PENDING" } }),
    prisma.asset.count({ where: { status: "SOLD" } }),
    prisma.asset.count({ where: { status: "SUSPENDED" } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { actor: { select: { name: true } } },
    }),
  ]);

  // Best-effort target-name resolution for the audit feed: targetId has no
  // FK (see schema.prisma's doc comment on AuditLog — it's a polymorphic
  // reference), so a plain follow-up lookup is how a display label gets
  // built. A target row is never actually gone in this app, but the lookup
  // still falls back to the bare id, since the schema explicitly allows for
  // that possibility.
  const userTargetIds = recentLogs.filter((l) => l.targetType === "USER").map((l) => l.targetId);
  const assetTargetIds = recentLogs.filter((l) => l.targetType === "ASSET").map((l) => l.targetId);
  const [targetUsers, targetAssets] = await Promise.all([
    userTargetIds.length
      ? prisma.user.findMany({ where: { id: { in: userTargetIds } }, select: { id: true, name: true } })
      : [],
    assetTargetIds.length
      ? prisma.asset.findMany({ where: { id: { in: assetTargetIds } }, select: { id: true, title: true } })
      : [],
  ]);
  const targetName = (targetType: string, targetId: string): string => {
    if (targetType === "USER") return targetUsers.find((u) => u.id === targetId)?.name ?? targetId;
    return targetAssets.find((a) => a.id === targetId)?.title ?? targetId;
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-xl font-semibold">Welcome, {manager.name}</h1>
        <p className="text-sm text-muted-foreground">{manager.email}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>By role and status</CardDescription>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="font-normal"></th>
                  <th className="font-normal">Active</th>
                  <th className="font-normal">Suspended</th>
                  <th className="font-normal">Removed</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium">Buyers</td>
                  <td>{buyerActive}</td>
                  <td>{buyerSuspended}</td>
                  <td>{buyerRemoved}</td>
                </tr>
                <tr>
                  <td className="font-medium">Sellers</td>
                  <td>{sellerActive}</td>
                  <td>{sellerSuspended}</td>
                  <td>{sellerRemoved}</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
            <CardDescription>By status</CardDescription>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="text-muted-foreground">Active</td>
                  <td className="text-right font-medium">{assetActive}</td>
                </tr>
                <tr>
                  <td className="text-muted-foreground">Pending</td>
                  <td className="text-right font-medium">{assetPending}</td>
                </tr>
                <tr>
                  <td className="text-muted-foreground">Sold</td>
                  <td className="text-right font-medium">{assetSold}</td>
                </tr>
                <tr>
                  <td className="text-muted-foreground">Suspended</td>
                  <td className="text-right font-medium">{assetSuspended}</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-medium">Recent moderation activity</h2>
        {recentLogs.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No moderation actions yet.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {recentLogs.map((log) => (
              <li key={log.id} className="rounded-xl border p-3 text-sm">
                <span className="font-medium">{log.actor.name}</span> {ACTION_LABEL[log.action]}{" "}
                <span className="font-medium">{targetName(log.targetType, log.targetId)}</span>
                {log.reason && <span className="text-muted-foreground"> — {log.reason}</span>}
                <div className="mt-1 text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Full participant and asset tables with search/filter and moderation actions: <br />
        <Link href="/manager/users" className="underline underline-offset-4">
          Users
        </Link>{" "}
        ·{" "}
        <Link href="/manager/assets" className="underline underline-offset-4">
          Assets
        </Link>
      </p>
    </div>
  );
}
