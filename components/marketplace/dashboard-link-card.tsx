import Link from "next/link";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * A dashboard summary tile that's also a link (seller/buyer dashboards).
 *
 * Two things a plain `<Link><Card>...</Card></Link>` gets wrong, both
 * visible once you actually click into one of these:
 *
 * 1. `<Link>` renders an `<a>`; as a CSS grid item it gets stretched to the
 *    row's height by default, but the `Card` inside it is a normal block
 *    box that only sizes to its own content — so it never actually fills
 *    that stretched height, and tiles with less content (e.g. a one-line
 *    description vs. a headline number) end up visibly shorter than their
 *    neighbors even though they share a grid row. `h-full` on both the
 *    link and the card fixes that.
 * 2. The `<a>`'s default focus outline is a plain UA rectangle that doesn't
 *    know about the card's rounded corners, so keyboard-focusing one of
 *    these draws a harsh box that pokes out past the visible rounded card
 *    — worse, since (1) means that `<a>` box can be a different size than
 *    the card, the rectangle doesn't even match the visible tile it's
 *    supposedly focusing. Suppressing the UA outline and drawing our own
 *    ring on the (now same-size) link fixes both at once.
 */
export function DashboardLinkCard({
  href,
  title,
  children,
  contentClassName,
}: {
  href: string;
  title: string;
  children: ReactNode;
  contentClassName?: string;
}) {
  return (
    <Link
      href={href}
      className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="h-full transition-colors group-hover:bg-accent/50">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className={contentClassName}>{children}</CardContent>
      </Card>
    </Link>
  );
}
