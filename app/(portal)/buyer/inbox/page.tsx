import { requireUser } from "@/lib/auth";
import { getInboxData } from "@/lib/inbox";
import { ContactInbox } from "@/components/marketplace/contact-inbox";

export default async function BuyerInboxPage() {
  const buyer = await requireUser({ role: "BUYER" });
  const inbox = await getInboxData(buyer.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <ContactInbox {...inbox} />
    </div>
  );
}
