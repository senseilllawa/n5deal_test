import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Quick actions</p>
        <h2 className="text-lg font-medium">Keep your search moving</h2>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Sellers and matching both rely on your profile — keep it current and check in on new listings often.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/buyer/profile" className={buttonVariants({ variant: "default" })}>
            Manage profile
          </Link>
          <Link href="/buyer/assets" className={buttonVariants({ variant: "outline" })}>
            Browse assets
          </Link>
          <Link href="/buyer/inbox" className={buttonVariants({ variant: "outline" })}>
            View messages
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
