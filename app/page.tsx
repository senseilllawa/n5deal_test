import Link from "next/link";
import { Building2, Search, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Placeholder landing page — the real marketing/all-listings page (see
// ARCHITECTURE.md, referencing n5deal.com/all-listing) is a later phase.
// This just needs to get a visitor to /login for now, with enough on
// screen that it doesn't read as an empty placeholder.
const ROLES = [
  {
    icon: Building2,
    title: "Seller",
    description: "Publish licensed financial assets, browse Buyers, and reach out directly.",
  },
  {
    icon: Search,
    title: "Buyer",
    description: "Describe your investment thesis and get matched against every live listing.",
  },
  {
    icon: ShieldCheck,
    title: "Platform Manager",
    description: "Oversee every participant and listing, and moderate what doesn't belong.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center gap-16 px-6 py-20 text-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">N5Deal Marketplace</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          B2B marketplace prototype for M&amp;A and financial-asset listings — Buyer, Seller, and Platform Manager
          roles.
        </p>
        {/* A link styled as a button — Base UI's Button explicitly disallows
            rendering an <a> through it (its `render` prop is for elements that
            can take on button semantics; a link has its own), so it's styled
            directly with buttonVariants instead. */}
        <Link href="/login" className={buttonVariants({ variant: "default" })}>
          Log in
        </Link>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 text-left sm:grid-cols-3">
        {ROLES.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <CardHeader>
              <Icon className="size-5 text-primary" aria-hidden="true" />
              <CardTitle className="mt-2">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </main>
  );
}
