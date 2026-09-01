import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Greeting } from "./greeting";
import { UsersOverviewCard } from "./users-overview-card";
import { AssetsOverviewCard } from "./assets-overview-card";
import { ModerationFeed, type ModerationLogEntry } from "./moderation-feed";
import { QuickAccess } from "./quick-access";
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

  const moderationLogs: ModerationLogEntry[] = recentLogs.map((log) => ({
    id: log.id,
    actorName: log.actor.name,
    actionLabel: ACTION_LABEL[log.action],
    targetName: targetName(log.targetType, log.targetId),
    reason: log.reason,
    createdAtLabel: formatDateTime(log.createdAt),
  }));

  return (
    <div className="flex flex-col gap-6 px-6 py-8">
      <Greeting name={manager.name} email={manager.email} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <UsersOverviewCard
          buyers={{ active: buyerActive, suspended: buyerSuspended, removed: buyerRemoved }}
          sellers={{ active: sellerActive, suspended: sellerSuspended, removed: sellerRemoved }}
        />
        <AssetsOverviewCard active={assetActive} pending={assetPending} sold={assetSold} suspended={assetSuspended} />
      </div>

      <ModerationFeed logs={moderationLogs} />

      <QuickAccess />
    </div>
  );
}
