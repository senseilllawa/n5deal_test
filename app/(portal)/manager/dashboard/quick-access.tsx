import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export function QuickAccess() {
  return (
    <Card>
      <CardHeader>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Quick access</p>
        <h2 className="text-lg font-medium">Keep things moving</h2>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Browse participant and asset tables with search, filters, and moderation actions.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/manager/users" className={buttonVariants({ variant: "default" })}>
            Users
          </Link>
          <Link href="/manager/assets" className={buttonVariants({ variant: "outline" })}>
            Assets
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
