import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { resolveReturnTo } from "@/lib/roles";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoginCard } from "./login-card";
import type { Role } from "@/lib/generated/prisma/enums";

const ROLE_SECTION: { role: Role; label: string; blurb: string }[] = [
  { role: "MANAGER", label: "Platform Manager", blurb: "Oversees participants and listings." },
  { role: "SELLER", label: "Seller", blurb: "Publishes assets, browses Buyers." },
  { role: "BUYER", label: "Buyer", blurb: "Browses assets, describes their investment interests." },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string; reason?: string }>;
}) {
  const { returnTo = null, reason } = await searchParams;

  // Already signed in as the right kind of account? Skip the picker instead
  // of showing it pointlessly. But NOT when proxy sent them here because
  // they're logged in as the *wrong* role (reason=forbidden) — that's
  // exactly when they need to see the picker (and the banner below) to
  // switch accounts, not get silently bounced back to the account they're
  // trying to get away from.
  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.status === "ACTIVE" && reason !== "forbidden") {
    redirect(resolveReturnTo(returnTo, currentUser.role));
  }

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true, status: true },
  });
  const byRole = Object.groupBy(users, (u) => u.role);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">N5Deal Marketplace — demo login</h1>
        <p className="text-sm text-muted-foreground">
          No password: pick any seeded account below to sign in as them. A Suspended or Removed account is shown for
          realism, but logging in as one is blocked — that&apos;s the demo of Platform Manager moderation.
        </p>
      </div>

      {reason === "forbidden" && (
        <Alert variant="destructive">
          <AlertTitle>Signed out</AlertTitle>
          <AlertDescription>
            You were redirected here because you weren&apos;t signed in, your session no longer has access, or your
            account isn&apos;t active anymore.
          </AlertDescription>
        </Alert>
      )}

      {ROLE_SECTION.map(({ role, label, blurb }) => (
        <section key={role} className="flex flex-col gap-3">
          <div>
            <h2 className="text-lg font-medium">{label}</h2>
            <p className="text-sm text-muted-foreground">{blurb}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(byRole[role] ?? []).map((account) => (
              <LoginCard key={account.id} account={account} returnTo={returnTo} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
