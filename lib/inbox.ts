import { prisma } from "@/lib/db";

export interface InboxItem {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  counterpart: { name: string; email: string };
  assetTitle: string | null;
}

export interface InboxData {
  incoming: InboxItem[];
  outgoing: InboxItem[];
}

/**
 * Shared by /seller/inbox and /buyer/inbox — a ContactRequest inbox looks
 * identical either way (see lib/actions/contact-request.ts), just filtered
 * by whose id `userId` is.
 */
export async function getInboxData(userId: string): Promise<InboxData> {
  const [incomingRaw, outgoingRaw] = await Promise.all([
    prisma.contactRequest.findMany({
      where: { toUserId: userId },
      orderBy: { createdAt: "desc" },
      include: { from: { select: { name: true, email: true } }, asset: { select: { title: true } } },
    }),
    prisma.contactRequest.findMany({
      where: { fromUserId: userId },
      orderBy: { createdAt: "desc" },
      include: { to: { select: { name: true, email: true } }, asset: { select: { title: true } } },
    }),
  ]);

  return {
    incoming: incomingRaw.map((item) => ({
      id: item.id,
      message: item.message,
      isRead: item.isRead,
      createdAt: item.createdAt,
      counterpart: item.from,
      assetTitle: item.asset?.title ?? null,
    })),
    outgoing: outgoingRaw.map((item) => ({
      id: item.id,
      message: item.message,
      isRead: item.isRead,
      createdAt: item.createdAt,
      counterpart: item.to,
      assetTitle: item.asset?.title ?? null,
    })),
  };
}
