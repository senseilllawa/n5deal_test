import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export function MarketplacePulse() {
  return (
    <Card>
      <CardHeader>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Marketplace pulse</p>
        <h2 className="text-lg font-medium">Ready to connect?</h2>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Discover buyers looking for assets like yours and start a conversation.
        </p>
        <Link href="/seller/buyers" className={buttonVariants({ variant: "default", className: "w-fit" })}>
          Find buyers
        </Link>
      </CardContent>
    </Card>
  );
}
