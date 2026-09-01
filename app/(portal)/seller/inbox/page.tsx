import { requireUser } from "@/lib/auth";
import { getInboxData } from "@/lib/inbox";
import { ContactInbox } from "@/components/marketplace/contact-inbox";

export default async function SellerInboxPage() {
  const seller = await requireUser({ role: "SELLER" });
  const inbox = await getInboxData(seller.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <ContactInbox {...inbox} emptyIncomingCta={{ href: "/seller/buyers", label: "Browse buyers" }} />
    </div>
  );
}
