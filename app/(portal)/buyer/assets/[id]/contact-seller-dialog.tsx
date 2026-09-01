"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendContactRequest, type SendContactState } from "@/lib/actions/contact-request";

// No asset picker (unlike seller/buyers' ContactBuyerDialog) — the asset is
// implicit, it's the one this page is about, passed as a fixed hidden field.
// No seller name shown either — see this route's page.tsx doc comment.
export function ContactSellerDialog({ sellerId, assetId }: { sellerId: string; assetId: string }) {
  const [open, setOpen] = useState(false);
  const boundAction = sendContactRequest.bind(null, sellerId);
  const [state, formAction, pending] = useActionState<SendContactState, FormData>(boundAction, null);

  // Adjusting state during render, not a useEffect — see CLAUDE.md Gotchas.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.ok) setOpen(false);
  }

  const formError = state && !state.ok ? state.formError : undefined;
  const fieldErrors = state && !state.ok ? state.fieldErrors : {};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>Contact Seller</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contact Seller</DialogTitle>
          <DialogDescription>They&apos;ll see your message and this listing in their inbox.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="assetId" value={assetId} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" rows={4} required minLength={10} />
            {fieldErrors.message && <p className="text-xs text-destructive">{fieldErrors.message[0]}</p>}
          </div>
          {formError && <p className="text-xs text-destructive">{formError}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Sending…" : "Send"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
